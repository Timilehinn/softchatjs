import React, { useContext, useEffect, useRef, useState, useMemo } from "react";
import ChatClient, {
  ChatEventGenerics,
  Conversation,
  Message,
  UserMeta,
} from "softchatjs-core";
import { ConnectionEvent, ConversationListMeta } from "softchatjs-core";
import styles from "./chat.module.css";
import ChatInput from "../inputs/chat-input";
import MessageList from "../conversation-list/conversation-list";
import { ConversationList as MainList } from "../user-conversations";
import {
  ConversationItem,
  useChatState,
} from "../../providers/clientStateProvider";
import { useChatClient } from "../../providers/chatClientProvider";
import { ImageViewer } from "../modals";
import { ChatTopNav } from "./ChatTopNav";

type ChatProps = {
  renderChatBubble?: (message: Message) => JSX.Element;
  renderConversationList?: (props: {
    conversations: ConversationItem[];
    onCoversationItemClick: (conversationItem: ConversationItem) => void;
  }) => JSX.Element;
  renderChatHeader?: () => JSX.Element;
  renderAddConversationIcon?: () => JSX.Element;
  renderChatInput?: (props: { onChange: (e: string) => void }) => JSX.Element;
  user: UserMeta;
};

const Chat = (props: ChatProps) => {
  const { client, config } = useChatClient();
  const {
    activeConversation,
    showImageModal,
    setActiveConversation,
    setConversations,
    conversations,
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
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [forceScrollCount, setForceScrollCount] = useState(0);
  const [recipientId, setRecipientId] = useState("");
  const conversationId = activeConversation?.conversation.conversationId!;
  const [isSmallScreen, setIsSmallScreen] = useState(false);

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
    if (client) {
      client.initializeUser(props.user);
    }
  }, [client]);

  useEffect(() => {
    const checkScreenSize = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      if (screenWidth < 1024 || screenHeight < 768) {
        setIsSmallScreen(true);
      } else {
        setIsSmallScreen(false);
      }
    };

    checkScreenSize();

    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

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
        setTimeout(() => {
          messagesEndRef?.current?.scrollIntoView({
            block: "end",
            behavior: "smooth",
          });
        }, 300);
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

  const handleConversationsListChanged = (e: {
    conversationListMeta: ConversationListMeta;
  }) => {
    const conversationList = Object.values(
      e.conversationListMeta
    ).flat() as ConversationItem[];
    console.log(conversationList, "::conversationList");
    setConversations(conversationList);
  };

  const clearUnread = () => {
    if (client && activeConversation) {
      const messageIds = activeConversation.unread;
      const msClient = client.messageClient(
        activeConversation.conversation.conversationId
      );
      msClient.readMessages(activeConversation?.conversation.conversationId, {
        uid: client.userMeta.uid,
        messageIds,
      });
    }
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

      client.subscribe(
        "conversation_list_meta_changed" as any,
        handleConversationsListChanged
      );
    }

    return () => {
      if (client) {
        client.unsubscribe("started_typing" as any, handleTypingStarted);
        client.unsubscribe("stopped_typing" as any, handleTypingStopped);
        client.unsubscribe("deleted_message" as any, handleDeletedMessage);
        client.unsubscribe("edited_message" as any, handleEditedMessage);
        client.unsubscribe("new_message" as any, handleMessage);
        client.unsubscribe(
          "connection_changed" as any,
          handleConnectionChanged
        );
        client.unsubscribe(
          "conversation_list_meta_changed" as any,
          handleConversationsListChanged
        );
      }
    };
  }, [client, activeConversation]);

  useEffect(() => {
    if (activeConversation) {
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
      if (client) {
        const getMoreMessages = async () => {
          setFetchingMore(true);
          const messageList = (await client
            .messageClient(activeConversation?.conversation?.conversationId!)
            .getMessages(presentPage)) as Array<Message>;
          setMessages((prev) => {
            return [...messageList, ...prev];
          });
          if (messages[0]) {
            setScrollToKey(messages[0].messageId);
          }
        };
        getMoreMessages();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingMore(false);
    }
  }, [presentPage]);

  const showMainList = useMemo(() => {
    if (isSmallScreen) {
      return false;
    }
    return mainListOpen;
  }, [mainListOpen, isSmallScreen]);

  if (isSmallScreen && activeConversation) {
    return (
      <div className={styles.chat__messages} style={{ width: "100%" }}>
        <ChatTopNav
          setMainListOpen={setMainListOpen}
          message={activeConversation?.lastMessage!}
          renderChatHeader={props.renderChatHeader}
        />
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
        {showImageModal.length > 0 && <ImageViewer />}
      </div>
    );
  }

  return (
    <div
      style={{ background: theme?.background?.primary }}
      className={styles.chat}
    >
      <div className={`${styles.chat__conversations}`}>
        {/* {props.renderConversationList ? (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "black",
              position: "relative",
            }}
          >
            {props.renderConversationList({
              conversations,
              onCoversationItemClick: (item) => {
                setActiveConversation(item);
                setMainListOpen(false);
              },
            })}
            {props.renderAddConversationIcon ? (
              <div
                style={{ position: "absolute", bottom: "10px", right: "10px" }}
              >
                {props.renderAddConversationIcon()}
              </div>
            ) : null}
          </div>
        ) : ( */}
        <MainList
          setShowUserList={setShowUserList}
          showUserList={showUserList}
          setMainListOpen={setMainListOpen}
          userListRef={userListRef}
          renderAddConversationIcon={props.renderAddConversationIcon}
          renderConversationList={props.renderConversationList}
        />
        {/* )} */}
      </div>
      {activeConversation && (
        <div className={styles.chat__messages}>
          <ChatTopNav
            setMainListOpen={setMainListOpen}
            message={activeConversation?.lastMessage!}
            renderChatHeader={props.renderChatHeader}
          />
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
