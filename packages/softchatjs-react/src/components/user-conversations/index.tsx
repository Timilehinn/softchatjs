import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import styles from "./index.module.css";
import { ChatEventGenerics, Conversation, Message } from "softchatjs-core";
import Text from "../text/text";
import { formatConversationTime, formatWhatsAppDate } from "../../helpers/date";
import { useChatState } from "../../providers/clientStateProvider";
import { useChatClient } from "../../providers/chatClientProvider";
import Avartar from "../avartar/avartar";
import { MdMessage } from "react-icons/md";
import { FaCheck } from "react-icons/fa6";

type ConversationItem = {
  conversation: Conversation;
  lastMessage: Message;
  unread: string[];
};

export const ConversationList = ({
  setMainListOpen,
  setShowUserList,
  showUserList,
  userListRef,
  renderAddConversationIcon,
}: {
  setMainListOpen: any;
  setShowUserList: Dispatch<SetStateAction<boolean>>;
  showUserList: boolean;
  userListRef: any;
  renderAddConversationIcon?: () => JSX.Element;
}) => {
  const { client, config } = useChatClient();
  const { setActiveConversation, conversations } = useChatState();
  // const [conversations, setConversations] = useState<
  //   { conversation: Conversation; lastMessage: Message; unread: string[] }[]
  // >([]);

  if (conversations.length === 0) {
    return (
      <div className={styles.list}>
        <Text text="No conversations yet" />
      </div>
    );
  }

  return (
    <div
      style={{ background: config?.theme?.background?.secondary || "#202326" }}
      className={styles.list}
    >
      {conversations.map((item, index) => (
        <ConversationItem
          item={item}
          onClick={() => {
            setActiveConversation(item);
            setMainListOpen(false);
          }}
        />
      ))}
      <div
        onClick={() => {
          setShowUserList(true);
        }}
        className={styles.newMessage}
      >
        {renderAddConversationIcon ? (
          renderAddConversationIcon()
        ) : (
          <MdMessage size={40} color="#015EFF" />
        )}
      </div>

      {showUserList && <UserList userListRef={userListRef} />}
    </div>
  );
};

const ConversationItem = ({
  item,
  onClick,
}: {
  item: {
    conversation: Conversation;
    lastMessage: Message;
    unread: string[];
  };
  onClick: () => void;
}) => {
  const { client, config } = useChatClient();
  const { activeConversation } = useChatState();

  const user = item.conversation.participantList.filter(
    (p) => p.participantId !== client.userMeta.uid
  );

  const textColor = config?.theme?.text?.primary || "white";

  const renderLastMessage = () => {
    if (item.lastMessage?.attachmentType === "media") {
      return (
        <div className={styles.media}>
          <img
            src={
              item.lastMessage.attachedMedia.find((i) => i.type === "image")
                ?.mediaUrl
            }
            alt=""
          />
          <Text
            styles={{
              textAlign: "left",
              color: textColor,
            }}
            size="sm"
            text={"Photo"}
          />
        </div>
      );
    }
    return (
      <Text
        styles={{ textAlign: "left", color: textColor }}
        size="sm"
        text={item.lastMessage?.message}
      />
    );
  };
  return (
    <div
      style={
        {
          // backgroundColor:
          //   activeConversation?.conversation.conversationId ===
          //   item.conversation.conversationId
          //     ? "#4a515a"
          //     : "transparent",
        }
      }
      className={styles.item}
      onClick={onClick}
    >
      <div className={styles.item__image}>
        <Avartar url={user[0].participantDetails?.profileUrl} />
        {/* <Avartar url={user[0].participantDetails.profileUrl} /> */}
      </div>
      <div style={{ width: "100%" }}>
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text
            styles={{ textAlign: "left", color: textColor }}
            weight="bold"
            text={user[0].participantDetails?.username}
          />
          <Text
            size="sm"
            styles={{ color: textColor }}
            text={formatConversationTime(item.lastMessage?.createdAt as any)}
          />
        </div>
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {renderLastMessage()}
          {item.unread.length > 0 && (
            <div className={styles.unread}>
              <Text
                size="xs"
                text={String(item.unread.length)}
                styles={{ color: "black" }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const UserList = ({ userListRef }: { userListRef: any }) => {
  const [selectedUsers, setSelectedUsers] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const { client, config } = useChatClient();

  const dummyUserList = [
    {
      id: "80",
      name: "Romanreins",
    },
    {
      id: "50",
      name: "mic",
    },
    {
      id: "200",
      name: "tom",
    },
    {
      id: "250",
      name: "sheldon",
    },
    {
      id: "260",
      name: "raj",
    },
  ];

  const startConvo = useCallback(() => {
    if (selectedUsers) {
      const conn = client.newConversation({
        uid: selectedUsers.id,
        username: selectedUsers.name,
      }, null);
      conn.create("Hey there");
    }
  }, [selectedUsers]);

  return (
    <div
      ref={userListRef}
      style={{ background: config?.theme?.background?.secondary || "#202326" }}
      className={styles.userList}
    >
      {dummyUserList.map((item, index) => (
        <div
          onClick={() => {
            setSelectedUsers(item);
          }}
          className={styles.userList__wrap}
        >
          <div className={styles.userList__user}>
            <div className={styles.userList__avartar}>
              <Text
                styles={{ color: config?.theme?.text?.primary || "white" }}
                text={item.name[0]}
              />
            </div>
            <Text
              size="sm"
              text={item.name}
              styles={{ color: config?.theme?.text?.primary || "white" }}
            />
          </div>
          {selectedUsers?.id === item.id && (
            <FaCheck color="#015EFF" size={14} />
          )}
        </div>
      ))}
      {selectedUsers ? (
        <div className={styles.userList__button}>
          <button onClick={startConvo}>Start</button>
        </div>
      ) : null}
    </div>
  );
};
