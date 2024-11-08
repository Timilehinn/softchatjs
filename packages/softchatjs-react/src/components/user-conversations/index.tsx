import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import styles from "./index.module.css";
import { ChatEventGenerics, Conversation, MediaType, Message } from "softchatjs-core";
import Text from "../text/text";
import { formatConversationTime, formatWhatsAppDate } from "../../helpers/date";
import { ConnectionStatus, useChatState } from "../../providers/clientStateProvider";
import { useChatClient } from "../../providers/chatClientProvider";
import Avartar from "../avartar/avartar";
import { MdMessage } from "react-icons/md";
import { FaCheck } from "react-icons/fa6";
import ConversationHeader from './ConversationHeader'
import { VerifiedIcon } from "../assets/icons";

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
  renderConversationList,
  connectionStatus
}: {
  setMainListOpen: any;
  setShowUserList: Dispatch<SetStateAction<boolean>>;
  showUserList: boolean;
  userListRef: any;
  renderAddConversationIcon?: () => JSX.Element;
  renderConversationList?: (props: {
    conversations: ConversationItem[];
    onCoversationItemClick: (conversationItem: ConversationItem) => void;
  }) => JSX.Element;
  connectionStatus: ConnectionStatus
}) => {
  const { client, config } = useChatClient();
  const { setActiveConversation, conversations } = useChatState();
  // const [conversations, setConversations] = useState<
  //   { conversation: Conversation; lastMessage: Message; unread: string[] }[]
  // >([]);

  const renderAddMessage = () => {
    return (
      <div
        onClick={() => {
          setShowUserList(true);
        }}
        className={styles.newMessage}
      >
        {renderAddConversationIcon ? (
          renderAddConversationIcon()
        ) : (
          <MdMessage size={40} color={config.theme.icon}/>
        )}
      </div>
    );
  };



  if (renderConversationList) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "green",
          position: "relative",
        }}
      >
        {renderConversationList({
          conversations,
          onCoversationItemClick: (item) => {
            setActiveConversation(item);
            setMainListOpen(false);
          },
        })}
        {renderAddMessage()}
        {showUserList && <UserList userListRef={userListRef} />}
      </div>
    );
  }

  // if (conversations.length === 0) {
  //   return (
  //     <div className={styles.list__empty}>
  //       <Text
  //         styles={{ textAlign: "center" }}
  //         text="Start a new conversation."
  //       />
  //       {renderAddMessage()}
  //       {showUserList && <UserList userListRef={userListRef} />}
  //     </div>
  //   );
  // }

  return (
    <div
      style={{ background: config?.theme?.background?.secondary, borderRight: `1px solid ${config.theme.divider}` }}
      className={styles.list}
    >
      <ConversationHeader connectionStatus={connectionStatus}theme={config.theme} />
      {conversations.length === 0 && (
        <div className={styles.list__empty}>
        <Text
          styles={{ textAlign: "center", color: config.theme.text.primary }}
          text="Start a new conversation."
        />
      </div>
      )}
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
          <MdMessage size={40} color={config.theme.icon} />
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
    (p) => p.participantId !== client.chatUserId
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
            text={"Media"}
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
      <div style={{ marginRight: '10px' }}>
        <Avartar initials={user[0].participantDetails?.username.substring(0,1)} size={50} url={user[0].participantDetails?.profileUrl} />
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
          <div style={{ display: 'flex', alignItems: 'center' }}>
          <Text
            styles={{ textAlign: "left", color: textColor, textTransform: "capitalize", marginRight: '5px' }}
            weight="bold"
            text={user[0].participantDetails?.username}
          />
          {item.conversation.conversationType === "admin-chat" as any && (
            <VerifiedIcon size={15} color={config.theme.icon} />
          )}
          </div>
         
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
      id: "20",
      name: "Romanreins",
    },
  ];

  const startConvo = useCallback(() => {
    if (selectedUsers) {
      const conn = client.newConversation(
        {
          uid: selectedUsers.id,
          username: selectedUsers.name,
        },
        null
      );
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
