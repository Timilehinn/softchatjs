import React, { useContext, useEffect, useRef, useState } from "react";

import ChatClient, {
  ChatEventGenerics,
  Conversation,
  Message,
} from "softchatjs-core/src";
import {
  ConnectionEvent,
  ConversationListMeta,
} from "softchatjs-core/dist/types";
import styles from "./chat.module.css";
import ChatInput from "../inputs/chat-input";
import MessageList from "../conversation-list/conversation-list";
import { ConversationList as MainList } from "../user-conversations";
import { SoftChatContext } from "../../providers/softChatProvider";
import {
  ConversationItem,
  useChatState,
} from "../../providers/clientStateProvider";
import { useChatClient } from "../../providers/chatClientProvider";
import { ImageViewer } from "../modals";

type ChatProps = {
  renderChatBubble?: (message: Message) => JSX.Element;
  renderConversationList?: (props: {
    conversations: ConversationItem[];
    onCoversationItemClick: (conversationItem: ConversationItem) => void;
  }) => JSX.Element;
  renderChatHeader?: () => JSX.Element;
  renderChatInput?: (props: { onChange: (e: string) => void }) => JSX.Element;
};

const Chat = (props: ChatProps) => {
  const { client, config } = useChatClient();
  const {
    activeConversation,
    showImageModal,
    setActiveConversation,
    setConversations,conversations
  } = useChatState();
  const [isConnected, setIsConnected] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [fecthingmore, setFetchingMore] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [editDetails, setEditDetails] = useState<{
    message: Message;
    isEditing?: boolean;
    isReplying?: boolean;
  }>();
  // 47698942
  const [recipientTyping, setRecipientTyping] = useState(false);
  const [presentPage, setpresentPage] = useState(1);
  const [mainListOpen, setMainListOpen] = useState(true);
  const [showUserList, setShowUserList] = useState(false);
  const [scrollToKey, setScrollToKey] = useState<string>("");
  const messagesEndRef: any = useRef<null | HTMLDivElement>(null);
  const [forceScrollCount, setForceScrollCount] = useState(0);
  const [recipientId, setRecipientId] = useState("");

  const conversationId = activeConversation?.conversation.conversationId!;

  const { theme } = config;

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [menuDetails, setMenuDetails] = useState<{
    element: JSX.Element | null;
  }>({
    element: null,
  });

  const generalMenuRef: any = useRef(null);
  const textInputRef: any = useRef(null);
  const userListRef: any = useRef(null);

  const closeGeneralMenu = (e: any) => {
    if (menuDetails.element && !generalMenuRef.current?.contains(e.target)) {
      setMenuDetails({
        element: null,
      });
    }
    if (!userListRef.current?.contains(e.target)) {
      setShowUserList(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", closeGeneralMenu);
  }, [generalMenuRef, closeGeneralMenu]);

  const handleMessage = (event?: any) => {
    console.log("fuckinglogthis");
    if (activeConversation) {
      if (
        event.message.conversationId ===
        activeConversation.conversation.conversationId
      ) {
        setMessages((prev) => {
          return [...prev, event.message];
        });
        setForceScrollCount(forceScrollCount + 1); //((:)
        messagesEndRef.current.scrollIntoView({});
      }
    }
  };

  const handleTypingStarted = (event: any) => {
    if (activeConversation) {
      console.log(
        activeConversation.conversation.conversationId,
        event.conversationId
      );
      if (
        activeConversation.conversation.conversationId === event.conversationId
      ) {
        setRecipientTyping(true);
      }
    }
  };

  const handleTypingStopped = (event: any) => {
    setRecipientTyping(false);
  };

  const handleDeletedMessage = (event: any) => {
    setMessages((prev) => {
      return prev.filter(
        (m: Message) => m.messageId !== event.message.messageId
      );
    });
  };

  const handleEditedMessage = (event: any) => {
    setMessages((prev: any) => {
      return prev.map((item: Message) => {
        if (item?.messageId === event?.message?.messageId) {
          return {
            ...item,
            ...event.message,
          };
        } else {
          return item;
        }
      });
    });
  };

  const handleConnectionChanged = (
    event: ChatEventGenerics<ConnectionEvent>
  ) => {
    setIsConnected(event.isConnected);
  };

  const clearUnread = () => {
    console.log(
      "should clear here",
      config,
      activeConversation.conversation.conversationId
    );
    const messageIds = activeConversation.unread;
    const msClient = client.messageClient(
      activeConversation.conversation.conversationId
    );
    msClient.readMessages(activeConversation?.conversation.conversationId, {
      uid: config.userId,
      messageIds,
    });
  };

  useEffect(() => {
    if (client && activeConversation) {
      const recipients = activeConversation.conversation.participants.filter(
        (id) => id !== client?.userMeta.uid
      );
      setRecipientId(recipients[0]);
      client
        .messageClient(activeConversation.conversation.conversationId)
        .setActiveConversation();
      clearUnread();
    }
  }, [activeConversation, client]);

  useEffect(() => {
    if (client) {
      return () => {
        client.unsubscribe("new_message" as any, handleMessage);
      };
    }
  }, [client, activeConversation]);

  useEffect(() => {
    if (client) {
      client.subscribe("connection_changed" as any, handleConnectionChanged);

      client.subscribe("new_message" as any, handleMessage);

      client.subscribe("edited_message" as any, handleEditedMessage);

      client.subscribe("started_typing" as any, handleTypingStarted);

      client.subscribe("stopped_typing" as any, handleTypingStopped);

      client.subscribe("deleted_message" as any, handleDeletedMessage);
    }

    return () => {
      client.unsubscribe("started_typing" as any, handleTypingStarted);
      client.unsubscribe("stopped_typing" as any, handleTypingStopped);
      client.unsubscribe("deleted_message" as any, handleDeletedMessage);
      client.unsubscribe("edited_message" as any, handleEditedMessage);
      client.unsubscribe("new_message" as any, handleMessage);
      client.unsubscribe("connection_changed" as any, handleConnectionChanged);
    };
  }, [client, activeConversation]);

  useEffect(() => {
    if (activeConversation) {
      setpresentPage(1);
      messagesEndRef.current.scrollIntoView({});
      setMessages(activeConversation.conversation.messages);
      setForceScrollCount(forceScrollCount + 1); //to trigger rerender
    }
  }, [isConnected, activeConversation]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({});
    }
  }, [forceScrollCount]);

  useEffect(() => {
    if (presentPage < 2) {
      return;
    }
    try {
      setFetchingMore(true);
      const getMoreMessages = async () => {
        const messageList = (await client
          .messageClient(activeConversation?.conversation?.conversationId!)
          .getMessages(presentPage)) as Array<Message>;
        setMessages((prev) => {
          return [...messageList, ...prev];
        });
        setScrollToKey(messages[0].messageId);
      };

      getMoreMessages();
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingMore(false);
    }
  }, [presentPage]);

  const handleConversationsListChanged = (e: {
    conversationListMeta: ConversationListMeta;
  }) => {
    const conversationList = Object.values(
      e.conversationListMeta
    ).flat() as ConversationItem[];
    setConversations(conversationList);
  };

  useEffect(() => {
    if (client) {
      client.subscribe(
        "conversation_list_meta_changed" as any,
        handleConversationsListChanged
      );
      return () => {
        client.unsubscribe(
          "conversation_list_meta_changed" as any,
          handleConversationsListChanged
        );
      };
    }
  }, [client]);



  return (
    <div
      style={{ background: theme?.background.primary || "#1b1d21" }}
      className={styles.chat}
    >
      <div
        className={`${
          mainListOpen
            ? styles.chat__conversations
            : styles.chat__conversations__hidden
        }`}
      >
        {props.renderConversationList ? (
          props.renderConversationList({
            conversations,
            onCoversationItemClick: (item) => {
              setActiveConversation(item);
              setMainListOpen(false);
            },
          })
        ) : (
          <MainList
            setShowUserList={setShowUserList}
            showUserList={showUserList}
            setMainListOpen={setMainListOpen}
            userListRef={userListRef}
           
          />
        )}
      </div>
      {activeConversation && (
        <div className={styles.chat__messages}>
          <MessageList
            setEditDetails={setEditDetails}
            messages={messages}
            mousePosition={position}
            conversationId={conversationId}
            client={client}
            textInputRef={textInputRef}
            presentPage={presentPage}
            setPresentPage={setpresentPage}
            recipientTyping={recipientTyping}
            setMainListOpen={setMainListOpen}
            recipientId={recipientId}
            scrollToKey={scrollToKey}
            fetchingMore={fecthingmore}
            messagesEndRef={messagesEndRef}
            renderChatBubble={props.renderChatBubble}
            renderChatHeader={props.renderChatHeader}
          />
          <ChatInput
            closeGeneralMenu={() => setMenuDetails({ element: null })}
            generalMenuRef={generalMenuRef}
            setMenuDetails={setMenuDetails}
            menuDetails={menuDetails}
            setEditDetails={setEditDetails}
            editProps={editDetails as any}
            recipientId={recipientId}
            conversationId={conversationId}
            client={client}
            recipientTyping={recipientTyping}
            textInputRef={textInputRef}
            renderChatInput={props.renderChatInput}
          />
        </div>
      )}
      {showImageModal.length > 0 && <ImageViewer />}
    </div>
  );
};

export default Chat;
