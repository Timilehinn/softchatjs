import { Dispatch, SetStateAction, useEffect, useState } from "react";
import styles from "./input.module.css";
import ChatClient, { Media, Message } from "softchatjs-core/src";
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
import "./input.module.css";
import { useChatClient } from "../../providers/chatClientProvider";
import { convertToMinutes } from "../../helpers/date";
import AudioPlayer from "../audio/audio-player";
import TrashIcon from "../assets/icons";
// import { AudioRecorder } from "react-audio-voice-recorder";
import { IoStopCircleOutline } from "react-icons/io5";
import { useChatState } from "../../providers/clientStateProvider";

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
  const [files, setFiles] = useState<any[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [sending, setSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState([]);
  const [audioRecorder, setAudioRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [voiceMessageDuration, setVoiceMessageDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioBlobPLaceHolder, setAudioBlobPlaceHolder] = useState<Blob | null>(
    null
  );

  const msClient = client.messageClient(conversationId);
  const { config } = useChatClient();
  const { theme } = config;

  const primaryActionColor = theme?.icon || "white";
  const inputBg = config?.theme?.input.bgColor || "#222529";

  useEffect(() => {
    if (editProps?.isEditing) {
      setMessage(editProps?.message);
    } else {
      setMessage({});
    }
  }, [editProps?.isEditing]);

  useEffect(() => {
    if (navigator.mediaDevices) {
      console.log("getUserMedia supported.");

      const constraints = { audio: true };
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          const mediaRecorder = new MediaRecorder(stream);
          console.log(mediaRecorder, ":::mediarecorder");
          setAudioRecorder(mediaRecorder);

          var chunks = [];

          mediaRecorder.onstop = (e) => {
            const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" });
            console.log(blob, ":audio blob");
            // const audioURL = URL.createObjectURL(blob);
            setAudioBlob(blob);
            // setVoiceMessageDuration(0)
            chunks = [];
          };

          mediaRecorder.onstart = () => {
            console.log("recording started");
          };

          mediaRecorder.ondataavailable = (e) => {
            console.log(e.data, "--audio data");
            chunks.push(e.data);
            if (voiceMessageDuration >= 300000) {
              mediaRecorder.stop();
            } else {
              setVoiceMessageDuration((v) => v + 1);
            }
          };
        })
        .catch((err) => {
          console.error(`The following error occurred: ${err}`);
        });
    } else {
      console.log("not media devices found");
    }
  }, []);

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

  const sendHandler = async () => {
    if (!message?.message?.length && !files.length && !audioBlob) {
      return;
    }
    setSending(true);

    const close = () => {
      setMessage({
        message: "",
      });
      setEditDetails(undefined);
    };

    try {
      let imageResData: any = [];
      let mediaData: Media[];
      console.log(files[0], "uploda");
      if (files.length) {
        // Wait for all uploads to complete using Promise.all

        const res = await msClient.uploadFile(files[0], {
          filename: files[0].name,
          mimeType: files[0].type,
        });

        const type = files[0].type.split("/")[0];
        console.log(type, "type");
        mediaData = [
          {
            type: type as any,
            ext: type === "image" ? ".png" : ".mp4",
            mediaId: uuidv4(),
            mediaUrl: res.link,
            mimeType: files[0].type,
          },
        ];
      }

      if (audioBlob) {
        const url = URL.createObjectURL(audioBlob);

        const res = await msClient.uploadFile(url, {
          filename: "random",
          mimeType: audioBlob.type,
        });

        mediaData = [
          {
            type: "audio" as any,
            ext: ".mp3",
            mediaId: uuidv4(),
            mediaUrl: res.link as any,
            mimeType: "audio/mp3",
            meta: {
              audioDurationSec: voiceMessageDuration,
            },
          },
        ];
      }

      const attachmentType =
        files.length || audioBlob
          ? { attachmentType: "media" as any }
          : { attachmentType: "none" };

      if (editProps?.isEditing) {
        msClient.editMessage({
          to: recipientId, // replace with actual userId
          conversationId,
          messageId: editProps?.message?.messageId as string,
          textMessage: message?.message as string,
          shouldEdit: true,
        });
        setEditDetails(undefined);
        close();

        return;
      }

      if (editProps?.isReplying) {
        msClient.sendMessage({
          conversationId,
          to: recipientId,
          message: message?.message as any,

          reactions: [],
          attachedMedia: mediaData,
          quotedMessage: editProps.message,
        });
        close();
        return;
      }

      msClient.sendMessage({
        conversationId,
        to: recipientId,
        message: message?.message as any,
        reactions: [],
        attachedMedia: mediaData,
        quotedMessage: null,
        ...attachmentType,
      });
      console.log("message sent");
      close();
    } catch (err) {
      console.log(err);
    } finally {
      setSending(false);
      setFiles([]);
      setAudioBlob(null);
    }
  };

  const addAudioElement = (blob: any) => {
    const url = URL.createObjectURL(blob);
    const audio = document.createElement("audio");
    audio.src = url;
    audio.controls = true;
    document.body.appendChild(audio);
    console.log(url);
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
    audioRecorder.start(1000);
    setIsRecording(true);
  };

  const stopRecording = () => {
    audioRecorder.stop();
    setIsRecording(false);
  };

  const cancelAudioAttachments = () => {
    setAudioBlob(null);
    setAudioBlobPlaceHolder(null);
  };

  if (isRecording) {
    return (
      <div
        style={{
          backgroundColor: theme?.background?.secondary || "#1b1d21",
          justifyContent: "flex-end",
          width: "100%",
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
            backgroundColor: theme?.background?.secondary || "#1b1d21",
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
    <div
      style={{ backgroundColor: theme?.background?.secondary || "#1b1d21" }}
      className={styles.input}
    >
      {
        <EditPanel
          message={editProps?.message}
          isEditing={editProps?.isEditing}
          isReplying={editProps?.isReplying}
          closePanel={() => setEditDetails(undefined)}
        />
      }
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
                ref={textInputRef}
                value={message?.message}
                onChange={(e) =>
                  setMessage({
                    ...message,
                    message: e.target.value,
                  })
                }
                placeholder="Type your message"
              />

              <CiFaceSmile
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={styles.input__emoji}
                size={24}
                color={primaryActionColor}
              />
            </div>
          )}

          {files.length || audioBlob ? (
            <ChatAttachments
              files={files}
              setFiles={setFiles}
              audioBlob={audioBlobPLaceHolder}
              voiceMessageDuration={voiceMessageDuration}
              cancelAudioAttachment={cancelAudioAttachments}
            />
          ) : null}
        </div>
        <div className={styles.input__button}>
          {audioBlob || message?.message || files.length ? (
            <div style={{ marginRight: "10px" }}>
              {sending ? (
                "..."
              ) : (
                <VscSend
                  onClick={sendHandler}
                  size={22}
                  color={primaryActionColor}
                />
              )}
            </div>
          ) : null}

          {!files.length && (
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
  );
};

const ChatAttachments = ({
  audioBlob,
  voiceMessageDuration,
  cancelAudioAttachment,
  files,
  setFiles,
}: {
  audioBlob: Blob;
  voiceMessageDuration: number;
  files: any[];
  setFiles: any;
  cancelAudioAttachment: () => void;
}) => {
  const deleteAttachment = (id: string) => {
    const imgs = files.filter((i) => i.name !== id);
    setFiles(imgs);
  };

  const { config } = useChatClient();

  const { theme } = config;
  console.log(files, "vid");
  return (
    <div className={styles.chatPhotos}>
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
          <AudioPlayer blob={audioBlob} duration={voiceMessageDuration} />
        </div>
      ) : null}
      {files.length
        ? files.map((item) => {
            const url = URL.createObjectURL(item);

            return (
              <div className={styles.chatPhotos__item}>
                {item.type === "video/quicktime" ? (
                  <video style={{ height: "35px", width: "35px" }} src={url} />
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
