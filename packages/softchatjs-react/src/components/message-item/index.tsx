import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import Avartar from "../avartar/avartar";

import styles from "./message-item.module.css";
import ChatClient, { Message } from "softchatjs-core";
import Text from "../text/text";
import dayjs from "dayjs";
import { formatMessageTime } from "../../helpers/date";
import OptionsPanel from "../options-panel/options-panel";
import { EmojiPanel, ReactionPanel } from "../emoji";
import { Media, Reaction } from "softchatjs-core";
import { useChatClient } from "../../providers/chatClientProvider";
import { ThreeDots } from "react-loader-spinner";
import { BsCheck, BsCheckAll, BsClock, BsX } from "react-icons/bs";
import { useChatState } from "../../providers/clientStateProvider";
import { MessageStates } from "softchatjs-core";
import AudioPlayer from "../audio/audio-player";

export const regex = {
  URL_REGEX:
    /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,8}(:[0-9]{1,5})?(\/.*)?$/gm,
};

type ConversationProps = {
  message: Message;
  index: number;
  onPress: (event: any, index: number, message: Message) => void;
  show: boolean;
  setEditDetails: Dispatch<
    SetStateAction<
      | { message: Message; isEditing?: boolean; isReplying?: boolean }
      | undefined
    >
  >;
  canEdit?: boolean;
  recipientTyping?: boolean;
  showEmojiPanel?: boolean;
  openEmojiPanel: () => void;
  optionsMenuRef: any;
  emojiPickerRef: any;
  mousePosition: {
    x: number;
    y: number;
  };
  client: ChatClient;
  conversationId: string;
  closeOptionsMenu: () => void;
  scrollToQuote: (id: string) => void;
  textInputRef: any;
  recipientId: string;
  hideAvartar: boolean;
  setShowEmojiPanel: Dispatch<SetStateAction<boolean>>;
};

export const MessageItem = (props: ConversationProps) => {
  const {
    message,
    index,
    onPress,
    show,
    setEditDetails,
    canEdit,
    showEmojiPanel,
    openEmojiPanel,
    optionsMenuRef,
    emojiPickerRef,
    mousePosition,
    client,
    conversationId,
    closeOptionsMenu,
    scrollToQuote,
    textInputRef,
    recipientId,
    hideAvartar,
  } = props;

  const hasAttachments = message?.attachedMedia?.length;
  const { config } = useChatClient();
  const stacked = true;
  var chatUserId = client.chatUserId

  const oppositBubbleBoxes = message.messageOwner.uid === chatUserId && stacked;

  const chatBoxColor =
    message.messageOwner.uid === chatUserId
      ? config.theme?.chatBubble?.right?.bgColor
      : config.theme?.chatBubble?.left?.bgColor || "#343434";

  const messageColor =
    message.messageOwner.uid === chatUserId
      ? config.theme?.chatBubble?.right?.messageColor
      : config.theme?.chatBubble?.left?.messageColor || "white";

  const messageDateColor =
    message.messageOwner.uid === chatUserId
      ? config.theme?.chatBubble?.right?.messageTimeColor
      : config.theme?.chatBubble?.left?.messageTimeColor || "grey";

  const messageState = () => {
    if (message.messageState === MessageStates.SENT) {
      return <BsCheck style={{ marginTop: "8px", color: "grey" }} />;
    }
    if (
      message.messageState === MessageStates.DELIVERED ||
      message.messageState === MessageStates.READ
    ) {
      return <BsCheckAll style={{ marginTop: "8px", color: "grey" }} />;
    }
    if (message.messageState === MessageStates.LOADING) {
      return <BsClock style={{ marginTop: "8px", color: "grey" }} />;
    }
    if (message.messageState === MessageStates.FAILED) {
      return <BsX style={{ marginTop: "8px", color: "red" }} />;
    }
    return <BsClock style={{ marginTop: "8px", color: "grey" }} />;
  };

  return (
    <div
      className={`${styles.conversation}`}
      onContextMenu={(event) => {
        onPress(event, index, message);
      }}
    >
      <div
        className={`${
          oppositBubbleBoxes
            ? styles.conversation__wrapper__alternate
            : styles.conversation__wrapper
        }`}
      >
        {!oppositBubbleBoxes && (
          <div className={styles.conversation__image}>
            {hideAvartar ? null : (
              <Avartar
                initials={message.messageOwner.username.substring(0, 1)}
                url={message.messageOwner.profileUrl}
              />
            )}
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            flexDirection: "column",
            justifyContent: "flex-start",
          }}
        >
          {showEmojiPanel ? (
            <EmojiPanel
              conversationId={conversationId}
              client={client}
              emojiPickerRef={emojiPickerRef}
              message={message}
              recipientId={recipientId}
              setShowEmojiPanel={props.setShowEmojiPanel}
            />
          ) : null}
          <div className={styles.conversation__text__container}>
            {oppositBubbleBoxes && (
              <div className={styles.conversation__text__container__reactions}>
                <ReactionPanel
                  textInputRef={textInputRef}
                  optionsMenuRef={optionsMenuRef}
                  canEdit={canEdit}
                  message={message}
                  setEditDetails={setEditDetails}
                  openEmojiPanel={openEmojiPanel}
                  mousePosition={mousePosition}
                  client={client}
                  conversationId={conversationId}
                  closeOptionsMenu={closeOptionsMenu}
                />
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <div
              style={{ backgroundColor: chatBoxColor }}
              className={`${styles.conversation__text__wrap} ${
                hasAttachments
                  ? styles.conversation__text__wrap__attach
                  : styles.conversation__text__wrap__no__attach
              } ${
                hideAvartar
                  ? styles.conversation__text__wrap__half__border
                  : `${
                      oppositBubbleBoxes
                        ? styles.conversation__text__wrap__border__alternate
                        : styles.conversation__text__wrap__border
                    }`
              }`}
            >
              {message.quotedMessageId && (
                <QuotedMessage
                  scrollToQuote={scrollToQuote}
                  message={message?.quotedMessage as any}
                />
              )}
              {hasAttachments ? (
                <AttachmentList attachments={message.attachedMedia} />
              ) : null}
              {message.message ? (
                <div
                  style={{
                    alignItems: "center",
                    paddingLeft: hasAttachments && "10px",
                    paddingRight: hasAttachments && "10px",
                    justifyContent: "space-between",
                    wordWrap: 'break-word',
                  }}
                >
                  <Text
                    styles={{
                      textAlign: "left",
                      marginRight: "15px",
                      color: messageColor,
                    }}
                    size="sm"
                    text={message?.message}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      marginTop:
                        message?.message?.length > 10 ? "0px" : "-25px",
                    }}
                  >
                    {message.lastEdited && (
                      <Text
                        styles={{
                          textAlign: "right",
                          marginRight: "5px",
                          color: messageDateColor,
                          fontSize: "9px",
                        }}
                        size="sm"
                        text={"(Edited)"}
                      />
                    )}
                    <Text
                      size="xs"
                      styles={{ color: messageDateColor }}
                      text={formatMessageTime(message.createdAt as string)}
                    />
                    {oppositBubbleBoxes && <>{messageState()}</>}
                  </div>
                </div>
              ) : null}
            </div>
            {/* {!hideAvartar && (
              
            )} */}
            {/* <div style={{ height: '20px', width: '20px', backgroundColor: hideAvartar? 'transparent' : chatBoxColor }}>
              <div style={{ backgroundColor: hideAvartar? 'transparent' : config.theme.background.primary, height: '100%', width: '100%', borderBottomLeftRadius: '15px' }} />
            </div> */}

            </div>
            {!oppositBubbleBoxes && (
              <div className={styles.conversation__text__container__reactions}>
                <ReactionPanel
                  textInputRef={textInputRef}
                  optionsMenuRef={optionsMenuRef}
                  canEdit={canEdit}
                  message={message}
                  setEditDetails={setEditDetails}
                  openEmojiPanel={openEmojiPanel}
                  mousePosition={mousePosition}
                  client={client}
                  conversationId={conversationId}
                  closeOptionsMenu={closeOptionsMenu}
                  // setEditDetails={setEditDetails}
                />
              </div>
            )}
          </div>

          {/* <div className={styles.conversation__wrapper__emojis}></div> */}
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: oppositBubbleBoxes ? "flex-end" : "flex-start",
            }}
          >
            <EmojiList reactions={message.reactions} message={message} />
          </div>
        </div>
      </div>
      {show ? (
        <OptionsPanel
          textInputRef={textInputRef}
          optionsMenuRef={optionsMenuRef}
          canEdit={canEdit}
          message={message}
          setEditDetails={setEditDetails}
          openEmojiPanel={openEmojiPanel}
          mousePosition={mousePosition}
          client={client}
          conversationId={conversationId}
          closeOptionsMenu={closeOptionsMenu}
        />
      ) : null}
    </div>
  );
};

const EmojiList = ({
  reactions,
  message,
}: {
  reactions: Reaction[];
  message: Message;
}) => {
  const { client } = useChatClient();
  const { conversationId } = message;

  const msClient = client.messageClient(conversationId);

  const deleteReaction = ({ emojiId }: { emojiId: string }) => {
    const filteredEmojis = reactions.filter((i) => i.uid !== emojiId);
    msClient.reactToMessage({
      conversationId,
      messageId: message.messageId,
      reactions: filteredEmojis,
      to: "30", // Make this dynamic
    });
  };
  return (
    <div className={styles.emoji}>
      {reactions.map((item, index) => (
        <div
          key={index}
          onClick={() => deleteReaction({ emojiId: item.uid })}
          className={styles.emoji__wrap}
        >
          <p>{item.emoji}</p>
        </div>
      ))}
    </div>
  );
};

const AttachmentList = ({ attachments }: { attachments: Media[] }) => {
  const { setShowImageModal } = useChatState();

  return (
    <div className={styles.attachments}>
      {attachments.map((i, index) => {
        if (i.type === "image") {
          return (
            <img
              onClick={() => setShowImageModal(attachments)}
              key={`${index}-attch`}
              src={i.mediaUrl}
              className={styles.image}
              alt="attached-images"
            />
          );
        }
        if (i.type === "video") {
          return (
            <video
              onClick={() => setShowImageModal(attachments)}
              key={`${index}-attch`}
              src={i.mediaUrl}
              className={styles.image}
              controls
            />
          );
        }
        if (i.type === "audio") {
          // return <audio src={i.mediaUrl} controls />;
          return (
            <AudioPlayer
              url={i?.mediaUrl}
              duration={i?.meta?.audioDurationSec || 0}
              blob={null}
            />
          );
        }
      })}
    </div>
  );
};

export const QuotedMessage = ({
  message,
  scrollToQuote,
}: {
  message: Message;
  scrollToQuote: (id: string) => void;
}) => {
  const msg = message?.messageOwner?.username;
  return (
    <div
      className={styles.quote}
      onClick={() => scrollToQuote(message.messageId)}
    >
      <div>
        <Text
          styles={{ color: "greenyellow", textAlign: "left" }}
          size="sm"
          weight="bold"
          text={msg?.length > 30 ? `${msg?.slice(0, 5)}...` : msg}
        />
        <Text
          size="xs"
          text={message?.message}
          styles={{ textAlign: "left" }}
        />
      </div>
      <img src={message?.attachedMedia[0]?.mediaUrl} alt="" />
    </div>
  );
};

export const FormattedText = ({ content }: { content: string }) => {
  const lines = content?.split("/");

  return (
    <>
      {lines?.map((line, lineIndex) => {
        return (
          <div style={{ display: "flex" }} key={lineIndex}>
            {line.split(" ")?.map((word, index) => {
              if (word.match(regex.URL_REGEX)) {
                return (
                  <>
                    <a style={{ textDecoration: "none" }} href={word}>
                      <Text
                        key={index}
                        styles={{
                          textAlign: "left",
                          marginRight: "4px",
                          color: "#1C9BEF",
                        }}
                        size="sm"
                        text={word}
                      />
                    </a>
                  </>
                );
              }

              return (
                <Text
                  styles={{ textAlign: "left", marginRight: "4px" }}
                  key={index}
                  text={word}
                  size="sm"
                />
              );
            })}
          </div>
        );
      })}
    </>
  );
};

export const TypingIndicator = ({ message }: { message: Message }) => {
  return (
    <div className={styles.typing__wrap}>
      <div style={{ marginRight: "10px" }}>
        <Avartar
          initials={message.messageOwner.username.substring(0, 1)}
          url={message.messageOwner.profileUrl}
        />
      </div>

      <ThreeDots
        visible={true}
        height="20"
        width="50"
        color="#343434"
        radius="9"
        ariaLabel="three-dots-loading"
        wrapperClass=""
      />
    </div>
  );
};
