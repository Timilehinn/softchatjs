import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo
} from "react";
import styles from "./index.module.css";
import { ChatEventGenerics, Conversation, MediaType, Message, UserMeta } from "softchatjs-core";
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
  renderConversationList,
  connectionStatus,
  resetState
}: {
  setMainListOpen: any;
  setShowUserList: Dispatch<SetStateAction<boolean>>;
  showUserList: boolean;
  userListRef: any;
  renderConversationList?: (props: {
    conversations: ConversationItem[];
    onCoversationItemClick: (conversationItem: ConversationItem) => void;
  }) => JSX.Element;
  connectionStatus: ConnectionStatus,
  resetState: () => void;
}) => {
  const { client, config } = useChatClient();
  const { setActiveConversation, conversations } = useChatState();
  const [ searchVal, setSearchVal ] = useState('')
  

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
      </div>
    );
  }

  const filteredConversations = useMemo(() => {
    try {
      const userId = client.chatUserId;
      const data = conversations.filter((c) => {

        const participantMatch = c.conversation.participantList.some((participant) => {
          const username = participant.participantDetails.username.toLowerCase();
          const firstname = participant.participantDetails?.firstname?.toLowerCase() || "";
          const lastname = participant.participantDetails?.lastname?.toLowerCase() || "";
          const uid = participant.participantDetails?.uid;
    
          return (
            uid !== userId && 
            (
              username.includes(searchVal.toLowerCase()) ||
              firstname.includes(searchVal.toLowerCase()) ||
              lastname.includes(searchVal.toLowerCase())
            )
          );
        });
        return participantMatch;
      });
    
      return data;
    } catch (error) {
      return conversations
    }
  }, [conversations, searchVal]);

  return (
    <div
      style={{ background: config?.theme?.background?.secondary, borderRight: `1px solid ${config.theme.divider}` }}
      className={styles.list}
    >
      <ConversationHeader 
        connectionStatus={connectionStatus}
        theme={config.theme} 
        onTextChange={(val) => setSearchVal(val)}
      />
      {filteredConversations.length === 0 && (
        <div className={styles.list__empty}>
        <Text
          styles={{ textAlign: "center", color: config.theme.text.primary }}
          text="Start a new conversation."
        />
      </div>
      )}
      {filteredConversations.map((item, index) => (
        <ConversationItem
          item={item}
          onClick={() => {
            setActiveConversation(item);
            setMainListOpen(false);
            resetState();
          }}
          borderBottom={''}
        />
      ))}
    </div>
  );
};

const ConversationItem = ({
  item,
  onClick,
  borderBottom
}: {
  item: {
    conversation: Conversation;
    lastMessage: Message;
    unread: string[];
  };
  onClick: () => void;
  borderBottom: string
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
        text={item.lastMessage?.message?.length > 75? item.lastMessage?.message?.substring(0, 75)+'...' : item.lastMessage?.message}
      />
    );
  };
  return (
    <div
      className={styles.item}
      onClick={onClick}
    >
      <div style={{ marginRight: '10px' }}>
        {user[0] && (
          <Avartar initials={user[0]?.participantDetails?.username?.substring(0,1)} size={40} url={user[0]?.participantDetails?.profileUrl} />
        )}
      </div>
      <div style={{ width: "100%", padding: '20px 0px 20px 0px', borderBottom }}>
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
            text={user[0]?.participantDetails?.username}
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

export const UserList = ({ users = [], userListRef }: { users?: UserMeta[], userListRef?: any }) => {
  const { client, config } = useChatClient();

  const startConversation = (item: UserMeta) => {
    const conn = client.newConversation(item, null);
    conn.create("Hey there 👋");
  }

  return (
    <div
      ref={userListRef}
      style={{ background: config?.theme?.background?.secondary || "#202326" }}
      className={styles.userList}
    >
      {users.map((item, index) => (
        <button
          key={index}
          onClick={() => {
            startConversation(item);
          }}
          className={styles.userList__wrap}
        >
          <div className={styles.userList__user}>
            <div className={styles.userList__avartar}>
              <Text
                styles={{ color: config?.theme?.text?.primary || "white" }}
                text={item.username}
              />
            </div>
            <Text
              size="sm"
              text={item.username}
              styles={{ color: config?.theme?.text?.primary || "white" }}
            />
          </div>
        </button>
      ))}
    </div>
  );
};
