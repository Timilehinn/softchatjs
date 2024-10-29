import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import EmojiPicker from "emoji-picker-react";
import styles from "./emoji.module.css";
import ChatClient, { Message } from "softchatjs-core";
import { SoftChatContext } from "../../providers/softChatProvider";
import { CiFaceSmile } from "react-icons/ci";
import { BsReply } from "react-icons/bs";
import { AiOutlineDelete } from "react-icons/ai";
import { useChatClient } from "../../providers/chatClientProvider";
import { useChatState } from "../../providers/clientStateProvider";

const emojis = ["👍", "😔", "🙂", "😮", "😃"];

type EmojiPanelProps = {
  emojiPickerRef: any;
  conversationId: string;
  client: ChatClient;
  message: Message;
  recipientId: string;
};

type ReactionPanelProps = {
  message: Message;
  setEditDetails: Dispatch<
    SetStateAction<
      | { message: Message; isEditing?: boolean; isReplying?: boolean }
      | undefined
    >
  >;
  canEdit?: boolean;
  openEmojiPanel: () => void;
  optionsMenuRef: any;
  mousePosition: {
    x: number;
    y: number;
  };
  conversationId: string;

  closeOptionsMenu: () => void;
  textInputRef: any;
  client: ChatClient;
};

export const EmojiPanel = (props: EmojiPanelProps) => {
  const { client, message, conversationId, recipientId } = props;
  const { config } = useChatClient();
  const bgColor = config?.theme?.background?.secondary || "#222529";

  const reactToMessage = ({ emoji }: { emoji: string }) => {
    const msClient = client.messageClient(conversationId);

    msClient.reactToMessage({
      conversationId,
      messageId: message.messageId,
      reactions: [
        {
          emoji,
          uid: config.userId,
        },
      ],
      to: recipientId,
    });
  };
  return (
    <div
      ref={props.emojiPickerRef}
      style={{ background: bgColor }}
      className={styles.emoji}
    >
      {/* <EmojiPicker
        onEmojiClick={(e) => {
          reactToMessage({ emoji: e.emoji });
        }}
        theme={"dark" as any}
      /> */}
      {emojis.map((item, index) => (
        <div
          key={index}
          onClick={() => reactToMessage({ emoji: item })}
          className={styles.reaction__emoji}
        >
          {item}
        </div>
      ))}
    </div>
  );
};

export const ReactionPanel = ({
  setEditDetails,
  message,
  closeOptionsMenu,
  textInputRef,
  openEmojiPanel,
  client,
  canEdit,
  conversationId,
}: ReactionPanelProps) => {
  const { config } = useChatClient();
  const iconColor = config.theme?.icon || "#72767D";

  const emojiList = [
    {
      emoji: <CiFaceSmile size={16} color={iconColor} />,
      onPress: () => {
        console.log("react");
        openEmojiPanel();
      },
      enabled: true,
    },
    {
      emoji: <BsReply size={16} color={iconColor} />,
      onPress: () => {
        setEditDetails({
          message,
          isReplying: true,
        });
        closeOptionsMenu();
        textInputRef.current?.focus();
      },
      enabled: true,
    },
    {
      emoji: <AiOutlineDelete size={16} color={iconColor} />,
      onPress: () => {
        const msClient = client.messageClient(conversationId);
        msClient.deleteMessage(message.messageId, message.to, conversationId);
      },
      enabled: canEdit,
    },
  ];
  return (
    <div className={styles.reactions}>
      {emojiList.map((item, index) => {
        if (item.enabled) {
          return (
            <div onClick={item.onPress} className={styles.reaction__emoji}>
              {item.emoji}
            </div>
          );
        }
      })}
    </div>
  );
};

export const InputEmojis = ({
  onEmojiPick,
}: {
  onEmojiPick: (emoji: string) => void;
}) => {
  const { config } = useChatClient();
  return (
    <EmojiPicker
      onEmojiClick={(e) => {
        onEmojiPick(e.emoji);
      }}
      theme={config?.theme?.input?.emojiPickerTheme || ("dark" as any)}
    />
  );
};
