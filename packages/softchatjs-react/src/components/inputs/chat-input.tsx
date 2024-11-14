import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
  useRef,
} from "react";
import styles from "./chat-input.module.css";
import "./chat-input.module.css";
import ChatClient, {
  AttachmentTypes,
  Media,
  MediaType,
  Message,
  generateId,
} from "softchatjs-core";
import {
  AiOutlineAudio,
  AiOutlineClose,
  AiOutlineDelete,
  AiOutlinePlus,
} from "react-icons/ai";
import EditPanel from "../edit-panel";
import Text from "../text/text";
import { AttachmentMenu, Menu } from "../menu";
import { v4 as uuidv4 } from "uuid";
import { MdCancel } from "react-icons/md";
import { IoMdSend } from "react-icons/io";
import { text } from "stream/consumers";
import { VscSend } from "react-icons/vsc";
// import AudioRecorder from "../audio";
// import AudioReactRecorder, { RecordState } from "audio-react-recorder";
import { CiFaceSmile } from "react-icons/ci";
import { InputEmojis } from "../emoji";
import { useChatClient } from "../../providers/chatClientProvider";
import { convertToMinutes } from "../../helpers/date";
import AudioPlayer from "../audio/audio-player";
import TrashIcon, { LockIcon } from "../assets/icons";
// import { AudioRecorder } from "react-audio-voice-recorder";
import { IoStopCircleOutline } from "react-icons/io5";
import { useChatState } from "../../providers/clientStateProvider";
import { LinearLoader } from "../Loaders/index";
// import { convertWebmToMp3 } from "@/src/helpers/toMp3";

const ChatInput = ({
  client,
  conversationId,
  recipientId,
  editProps,
  setEditDetails,
  recipientTyping,
  setMenuDetails,
  menuDetails,
  generalMenuRef,
  closeGeneralMenu,
  textInputRef,
  renderChatInput,
}: {
  client: ChatClient;
  conversationId: string;
  recipientId: string;
  editProps: {
    message: Message;
    isEditing?: boolean;
    isReplying?: boolean;
  };
  setEditDetails: Dispatch<
    SetStateAction<
      | { message: Message; isEditing?: boolean; isReplying?: boolean }
      | undefined
    >
  >;
  recipientTyping: boolean;
  menuDetails: { element: JSX.Element | null };
  setMenuDetails?: Dispatch<SetStateAction<{ element: JSX.Element | null }>>;
  generalMenuRef: any;
  closeGeneralMenu: () => void;
  textInputRef: any;
  renderChatInput?: (props: { onChange: (e: string) => void }) => JSX.Element;
}) => {
  const [message, setMessage] = useState<Partial<Message>>();
  const [files, setFiles] = useState<File[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [sending, setSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState([]);
  const [audioRecorder, setAudioRecorder] = useState<MediaRecorder | null>(
    null
  );
  const inputContainerRef = useRef<HTMLDivElement>();
  const [voiceMessageDuration, setVoiceMessageDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioBlobPLaceHolder, setAudioBlobPlaceHolder] = useState<Blob | null>(
    null
  );
  const [inputContainerWidth, setInputContainerWidth] = useState(0);

  const msClient = client.messageClient(conversationId);
  const { config } = useChatClient();
  const { theme } = config;
  const { activeConversation } = useChatState();
  const [uploading, showUploading] = useState(false);
  const primaryActionColor = theme?.icon || "white";
  const inputBg = config?.theme?.input.bgColor || "#222529";

  const updateWidth = () => {
    if (inputContainerRef.current) {
      const { width } = inputContainerRef?.current?.getBoundingClientRect();
      setInputContainerWidth(width);
    }
  };

  useEffect(() => {
    updateWidth();
  }, []);

  useEffect(() => {
    if (editProps?.isEditing) {
      setMessage(editProps?.message);
    } else {
      setMessage({});
    }
  }, [editProps?.isEditing]);

  const prepareAudio = () => {
    if (navigator.mediaDevices) {
      const constraints = { audio: true };
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorder.start(1000);
          setIsRecording(true);
          setAudioRecorder(mediaRecorder);

          var chunks = [];

          mediaRecorder.onstop = (e) => {
            const blob = new Blob(chunks, { type: 'audio/mp3' });
            chunks = [];
            setAudioBlob(blob);
          };

          mediaRecorder.onstart = () => {};

          mediaRecorder.ondataavailable = (e) => {
            chunks.push(e.data);
            if (voiceMessageDuration >= 300) {
              mediaRecorder.stop();
            } else {
              setVoiceMessageDuration((t) => t + 1);
            }
          };
        })
        .catch((err) => {
          console.error(`The following error occurred: ${err}`);
        });
    } else {
      console.log("not media devices found");
    }
  }

  // useEffect(() => {
  //   if(audioRecorder) {

  //   }
  // },[audioRecorder]);

  useEffect(() => {
    let debounceTimer: NodeJS.Timeout | undefined;
    let idleTimer: NodeJS.Timeout | undefined;
    if (message?.message && message.message.length > 0) {
      clearTimeout(debounceTimer);
      // set a new debounce timer to send a typing notification after 350ms
      debounceTimer = setTimeout(() => {
        if (client) {
          client
            .messageClient(conversationId)
            .sendTypingNotification(recipientId);
          debounceTimer = undefined; // clear debounce timer reference after sending the typing notification
        }
      }, 300);
      // clear the previous idle timer (stopped typing)
      clearTimeout(idleTimer);
      // set a new idle timer to send a stopped typing notification after 1300ms of inactivity
      idleTimer = setTimeout(() => {
        if (client) {
          client
            .messageClient(conversationId)
            .sendStoppedTypingNotification(recipientId);
        }
      }, 1300);
    }
    return () => clearTimeout(debounceTimer);
  }, [message?.message, conversationId]);

  const uploadMessageAttachment = async () => {
    try {
      let mediaData: Media[] = []
      if (files.length > 0) {
        // Wait for all uploads to complete using Promise.all
        const type = files[0].type.split("/")[0];

        showUploading(true);
        const res = await msClient.uploadFile(files[0], {
          filename: files[0].name,
          mimeType: files[0].type,
          ext: type === "image" ? ".png" : ".mp4",
        });


        mediaData.push({
          type: type === "image" ? MediaType.IMAGE : MediaType.VIDEO,
          ext: type === "image" ? ".png" : ".mp4",
          mediaId: uuidv4(),
          mediaUrl: res.link,
          mimeType: files[0].type,
        });
      }

      if (audioBlob) {
        showUploading(true);
        // const mp3Blob = await convertWebmToMp3(audioBlob);
        // console.log(mp3Blob, ":::new blob")
        console.log(audioBlob)
        const url = URL.createObjectURL(audioBlob);
        const res = await msClient.uploadFile(url, {
          filename: `${generateId()}.mp3`,
          mimeType: 'audio/mp3',
          ext: '.mp3'
        });
        mediaData.push({
          type: MediaType.AUDIO,
          ext: ".mp3",
          mediaId: uuidv4(),
          mediaUrl: res.link as any,
          mimeType: "audio/mp3",
          meta: {
            audioDurationSec: voiceMessageDuration,
          },
        });
        setVoiceMessageDuration(0);
      }
      return mediaData;
    } catch (error) {
      console.error(error.message);
      return [];
    } finally {
      showUploading(false);
    }
  };

  const reset = () => {
    setMessage({
      message: "",
    });
    setEditDetails(undefined);
  };

  const sendMessage = async () => {
    var mediaData = await uploadMessageAttachment();
    msClient.sendMessage({
      conversationId,
      to: recipientId,
      message: message?.message as any,
      reactions: [],
      attachedMedia: mediaData,
      quotedMessage: editProps?.message,
      attachmentType:
        mediaData.length > 0 ? AttachmentTypes.MEDIA : AttachmentTypes.NONE,
    });
    reset();
  };

  const sendEditedMessage = async () => {
    msClient.editMessage({
      to: recipientId,
      conversationId,
      messageId: editProps?.message?.messageId as string,
      textMessage: message?.message as string,
      shouldEdit: true,
    });
    reset();
  };

  const broadcastMessage = async () => {
    var mediaData = await uploadMessageAttachment();
    client.messageClient(conversationId).broadcastMessage({
      broadcastListId: conversationId,
      participantsIds: activeConversation.conversation.participants,
      newMessage: {
        conversationId: conversationId,
        to: recipientId,
        message: message?.message,
        reactions: [],
        attachedMedia: mediaData,
        attachmentType:
          mediaData.length > 0 ? AttachmentTypes.MEDIA : AttachmentTypes.NONE,
        quotedMessage: editProps?.message,
      },
    });
    reset();
  };

  const sendHandler = async () => {
    setSending(true);
    try {
      
      if (!message?.message?.length && !files.length && !audioBlob) {
        return;
      }
      if (
        activeConversation?.conversation.conversationType === "broadcast-chat"
      ) {
        if(editProps?.isEditing){
          return sendEditedMessage()
        }
        return broadcastMessage();
      }
      if (editProps?.isEditing) {
        return sendEditedMessage();
      }
      sendMessage()
     
    } catch (err) {
      console.log(err);
    } finally {
      setSending(false);
      setFiles([]);
      setAudioBlob(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && message?.message?.length) {
      // Check if Enter is pressed and message is not empty
      sendHandler();
    }
  };

  const addAudioElement = (blob: any) => {
    const url = URL.createObjectURL(blob);
    const audio = document.createElement("audio");
    audio.src = url;
    audio.controls = true;
    document.body.appendChild(audio);
  };

  // if (1)
  //   return (
  //     <AudioRecorder
  //       onRecordingComplete={addAudioElement}
  //       audioTrackConstraints={{
  //         noiseSuppression: true,
  //         echoCancellation: true,
  //       }}
  //       downloadOnSavePress={true}
  //       downloadFileExtension="webm"
  //     />
  //   );

  const recordVoiceMessage = () => {
    prepareAudio();
    
  };

  const stopRecording = () => {
    audioRecorder.stop();
    setIsRecording(false);
  };

  const cancelAudioAttachments = () => {
    setAudioBlob(null);
    setAudioBlobPlaceHolder(null);
  };

  if (
    activeConversation?.conversation?.conversationType === "admin-chat"
  ) {
    return (
      <div
        style={{
          padding: "20px",
          flex: 1,
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <LockIcon color="white" size={20} />
        <Text
          size="xs"
          styles={{ marginLeft: "5px" }}
          text={"Only the Admin can send messages."}
        />
      </div>
    );
  }

  if (isRecording) {
    return (
      <div
        style={{
          backgroundColor: theme?.background?.secondary,
          justifyContent: "flex-end",
          width: "100%",
          flex: 1,
        }}
        className={styles.input}
      >
        <div
          className={styles.input__inner}
          style={{
            width: "30%",
            fontStyle: "italic",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px",
            backgroundColor: theme?.background?.secondary,
            boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
          }}
        >
          <button
            onClick={stopRecording}
            style={{
              backgroundColor: "transparent",
              border: 0,
              marginRight: "12px",
            }}
          >
            <IoStopCircleOutline
              style={{ marginTop: "5px" }}
              color="red"
              size={23}
            />
          </button>
          <div
            style={{
              flex: 1,
              width: "100%",
              height: "2px",
              backgroundColor: "grey",
            }}
          >
            <div
              style={{
                height: "100%",
                backgroundColor: "white",
                width: `${(voiceMessageDuration / 300) * 100}%`,
              }}
            />
          </div>
          <p
            style={{
              fontSize: "11.5px",
              marginLeft: "15px",
              color: theme?.text?.primary,
            }}
          >
            {convertToMinutes(voiceMessageDuration)} : {convertToMinutes(300)}
          </p>
        </div>
      </div>
    );
  }

  if (audioBlob && !audioBlobPLaceHolder) {
    return (
      <div
        style={{
          width: "100%",
          backgroundColor: theme?.background?.secondary || "#1b1d21",
          justifyContent: "flex-start",
          display: "flex",
          alignItems: "center",
        }}
        className={styles.input}
      >
        <div
          className={styles.input__inner}
          style={{
            width: "30%",
            fontStyle: "italic",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px",
            marginRight: "10px",
            backgroundColor: theme?.background?.secondary || "#1b1d21",
            boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
          }}
        >
          <button
            onClick={() => {
              setAudioBlob(null);
              setVoiceMessageDuration(0);
            }}
            style={{ backgroundColor: "transparent", border: 0 }}
          >
            <AiOutlineDelete size={22} color={"red"} />
          </button>
          <AudioPlayer blob={audioBlob} duration={voiceMessageDuration} />
        </div>
        <VscSend
          onClick={() => {
            setAudioBlobPlaceHolder(audioBlob);
          }}
          size={22}
          color={primaryActionColor}
        />
      </div>
    );
  }

  return (
    <div ref={inputContainerRef} style={{ height: "auto", width: "100%" }}>
      {uploading && <LinearLoader />}
      <EditPanel
        width={inputContainerWidth}
        message={editProps?.message}
        isEditing={editProps?.isEditing}
        isReplying={editProps?.isReplying}
        closePanel={() => setEditDetails(undefined)}
      />
      {files.length || audioBlob ? (
        <ChatAttachments
          width={inputContainerWidth}
          files={files}
          setFiles={setFiles}
          audioBlob={audioBlobPLaceHolder}
          voiceMessageDuration={voiceMessageDuration}
          cancelAudioAttachment={cancelAudioAttachments}
        />
      ) : null}
      <div
        style={{ backgroundColor: theme?.background?.secondary }}
        className={styles.input}
      >
        <div className={styles.input__wrap}>
          <div className={styles.input__icon}>
            {!audioBlob && (
              <div>
                <AiOutlinePlus
                  onClick={() =>
                    setMenuDetails?.({
                      element: (
                        <AttachmentMenu
                          closeGeneralMenu={closeGeneralMenu}
                          setFiles={setFiles}
                        />
                      ),
                    })
                  }
                  color={primaryActionColor}
                  size={22}
                />
              </div>
            )}
          </div>
          <div
            className={styles.input__inner}
            style={{ flex: 1, fontStyle: "italic", background: inputBg }}
          >
            {renderChatInput ? (
              renderChatInput({
                onChange: (e) => {
                  setMessage({
                    ...message,
                    message: e,
                  });
                },
              })
            ) : (
              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  style={{
                    background: inputBg,
                    color: theme?.input?.textColor || "white",
                  }}
                  onKeyDown={handleKeyDown}
                  ref={textInputRef}
                  value={message?.message}
                  onChange={(e) =>
                    setMessage({
                      ...message,
                      message: e.target.value,
                    })
                  }
                  placeholder="Say something..."
                />

                <CiFaceSmile
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={styles.input__emoji}
                  size={24}
                  color={primaryActionColor}
                />
              </div>
            )}
          </div>
          <div className={styles.input__button}>
            {/* {audioBlob || message?.message || files.length > 0 ? (
              <div>
                {sending ? (
                  "..."
                ) : (
                  <VscSend
                    onClick={sendHandler}
                    size={20}
                    color={primaryActionColor}
                  />
                )}
              </div>
            ) : null} */}

            {!message?.message ? (
              <button
                onClick={recordVoiceMessage}
                style={{
                  backgroundColor: "transparent",
                  border: 0,
                  cursor: "pointer",
                }}
              >
                <AiOutlineAudio color={primaryActionColor} size={20} />
              </button>
            ) : (
              <VscSend
                onClick={sendHandler}
                size={20}
                color={primaryActionColor}
              />
            )}
          </div>
          {menuDetails.element ? (
            <div className={styles.input__menu}>
              <Menu
                generalMenuRef={generalMenuRef}
                element={menuDetails.element}
              />
            </div>
          ) : null}
          {showEmojiPicker ? (
            <div className={styles.input__emoji__picker}>
              <InputEmojis
                onEmojiPick={(e) => {
                  setMessage({
                    ...message,
                    message: e,
                  });
                  setShowEmojiPicker(false);
                }}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const ChatAttachments = ({
  audioBlob,
  voiceMessageDuration,
  cancelAudioAttachment,
  files,
  setFiles,
  width,
}: {
  audioBlob: Blob;
  voiceMessageDuration: number;
  files: any[];
  setFiles: any;
  cancelAudioAttachment: () => void;
  width: number;
}) => {
  const deleteAttachment = (id: string) => {
    const imgs = files.filter((i) => i.name !== id);
    setFiles(imgs);
  };

  const { config } = useChatClient();

  const { theme } = config;

  return (
    <div className={styles.chatPhotos} style={{ width, paddingBottom: "10px" }}>
      {audioBlob ? (
        <div
          style={{
            padding: "10px",
            background: theme?.background?.primary || "#1b1d21",
            borderRadius: "30px",
            cursor: "pointer",
            position: "relative",
          }}
        >
          <div onClick={cancelAudioAttachment} className={styles.audioCancel}>
            <MdCancel size={20} color="grey" />
          </div>
          <div
            style={{
              border: `1px solid ${theme.divider}`,
              borderRadius: "5px",
            }}
          >
            <AudioPlayer
              style={{ padding: "15px" }}
              blob={audioBlob}
              duration={voiceMessageDuration}
            />
          </div>
        </div>
      ) : null}
      {files.length
        ? files.map((item, i) => {
            const url = URL.createObjectURL(item);
            return (
              <div key={i} className={styles.chatPhotos__item}>
                {item.type === "video/quicktime" ? (
                  <video style={{}} src={url} />
                ) : (
                  <img src={url as any} alt="" />
                )}

                <div
                  onClick={() => deleteAttachment(item.name)}
                  className={styles.chatPhotos__cancel}
                >
                  <MdCancel size={20} color="grey" />
                </div>
              </div>
            );
          })
        : null}
    </div>
  );
};

export default ChatInput;
