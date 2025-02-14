import React, { useContext, useEffect, useRef, useState, useMemo } from "react";
import ChatClient, {
  ChatEventGenerics,
  Conversation,
  Message,
  UserMeta,
  ConnectionEvent, 
  ConversationListMeta
} from "softchatjs-core";
import styles from "./chat.module.css";
import ChatInput from "../inputs/chat-input";
import MessageList from "../message-list/message-list";
import { ConversationList as MainList } from "../user-conversations";
import {
  ConversationItem,
  useChatState,
} from "../../providers/clientStateProvider";
import { useChatClient } from "../../providers/chatClientProvider";
import { ImageViewer } from "../modals";
import { ChatTopNav } from "./ChatTopNav";
import { ChatIcon } from "../assets/icons";
import Navbar, { NavButton } from "../navigation";
import BroadcastLists from '../broadcast-lists'

type ChatProps = {
  renderChatBubble?: (message: Message) => JSX.Element;
  renderConversationList?: (props: {
    conversations: ConversationItem[];
    onCoversationItemClick: (conversationItem: ConversationItem) => void;
  }) => JSX.Element;
  renderChatHeader?: () => JSX.Element;
  renderChatInput?: (props: { onChange: (e: string) => void }) => JSX.Element;
  renderNavbar?: (props: NavButton[]) => JSX.Element;
  onCreateBroadcastList?: () => void;
  user: UserMeta;
  userList?: UserMeta[];
  /**
   * use activeConversationId to preselect a conversation once the user enters the chat. 
   */
  activeConversationId?: string
  /**@note
   * This value calculates the the height off the container incase of an external header
   * Value should be in px i.e 300
   */
  headerHeightOffset?: number;
  /**
   * FCM token used to send push notifications to web users
   */
  webToken?: string
   /**
   * Hide the broadcast icon on the navigation bar
   * NOTE: this doesn't disable the functionality itself
   */
  enableBroadcasts?: boolean
};

const Chat = (props: ChatProps) => {
  const { headerHeightOffset = 0, user, userList = [], onCreateBroadcastList, activeConversationId, webToken, enableBroadcasts = true } = props;
  const chatUserId = user.uid;
  const { client, config } = useChatClient();
  const {
    activeConversation,
    showImageModal,
    setActiveConversation,
    setConversations,
    conversations,
    connectionStatus,
    setConnectionStatus,
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
  
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [inputContainerWidth, setInputContainerWidth] = useState(0);
  const [ view, setView ] = useState<"conversation-list" | "broadcast-lists">("conversation-list")

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

  const resetState = () => {
    setpresentPage(1);
  };

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

  const getPreSelectedConversation = () => {
    try {
      if(activeConversationId){
        const converationListMeta = client.getConversations();
        const selectedConveration = converationListMeta[activeConversationId];
        if(selectedConveration){
          setActiveConversation(selectedConveration);
        }
      }
    } catch (error) {
      console.error(error.message)
    }
  }

  useEffect(() => {
    getPreSelectedConversation();
  },[activeConversationId, client, connectionStatus])

  useEffect(() => {
    if(props.user && webToken){
      client.initializeUser(props.user, { notificationConfig: { type: "fcm", token: webToken } });
    }else{
      client.initializeUser(props.user);
    }
  }, [props.user, webToken]);

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
      const newMessages = prev.map((item: Message) => {
        if (item?.messageId === event?.message?.messageId) {
          return { ...item, ...event.message };
        }
        return item;
      });
      return [...newMessages];
    });
  };

  const handleConnectionChanged = (
    event: ChatEventGenerics<ConnectionEvent>
  ) => {
    setConnectionStatus(event);
  };

  const handleConversationsListChanged = (e: {
    conversationListMeta: ConversationListMeta;
  }) => {
    const conversationList = Object.values(
      e.conversationListMeta
    ).flat() as ConversationItem[];
    conversationList.sort(
      (a, b) =>
        new Date(b.lastMessage?.createdAt).getTime() -
        new Date(a.lastMessage?.createdAt).getTime()
    );
    setConversations(conversationList);
  };

  const clearUnread = () => {
    if (client && activeConversation) {
      const messageIds = activeConversation.unread;
      const msClient = client.messageClient(
        activeConversation.conversation.conversationId
      );
      msClient.readMessages(activeConversation?.conversation.conversationId, {
        uid: chatUserId,
        messageIds,
      });
    }
  };

  useEffect(() => {
    if (client && activeConversation) {
      const recipients = activeConversation.conversation.participants.filter(
        (id) => id !== chatUserId
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
      resetState();
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

  const getBroadcastMessages = async (conversationId: string) => {
    try {
      if (client) {
        const messageList = (await client
          .messageClient(conversationId)
          .getBroadcastListMessages(1)) as Array<Message>;
        setMessages(messageList);
        setpresentPage(2);
        if (messages[0]) {
          setScrollToKey(messages[0].messageId);
        }
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  const getMessages = async (conversationId: string) => {
    try {
      if (client) {
        const messageList = (await client
          .messageClient(conversationId)
          .getMessages(1)) as Array<Message>;
        setMessages(messageList);
        setpresentPage(2);
        if (messages[0]) {
          setScrollToKey(messages[0].messageId);
        }
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  const getOlderMessages = async (func: () => void) => {
    try {
      if (client && presentPage > 1) {
        setFetchingMore(true);
        const messageList = (await client
          .messageClient(activeConversation?.conversation?.conversationId!)
          .getMessages(presentPage)) as Array<Message>;
        setMessages((prev) => {
          return [...messageList, ...prev];
        });
        setpresentPage((p) => p + 1);
        if (messages[0]) {
          setScrollToKey(messages[0].messageId);
        }
        func();
      }
    } catch (error) {
      console.error(error.message);
    } finally {
      setFetchingMore(false);
    }
  };

  useEffect(() => {
    try {
      var conversationId = activeConversation?.conversation?.conversationId
      if (conversationId) {
        if(activeConversation.conversation.conversationType === "broadcast-chat"){
          getBroadcastMessages(conversationId)
        }else{
          getMessages(conversationId);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingMore(false);
    }
  }, [activeConversation?.conversation?.conversationId]);

  const showMainList = useMemo(() => {
    if (isSmallScreen) {
      return false;
    }
    return mainListOpen;
  }, [mainListOpen, isSmallScreen]);

  if (isSmallScreen && activeConversation) {
    return (
      <div
        className={styles.chat__messages}
        style={{ width: "100%", backgroundColor: theme?.background?.primary }}
      >
        <ChatTopNav
          setMainListOpen={setMainListOpen}
          renderChatHeader={props.renderChatHeader}
          onClose={resetState}
          chatUserId={chatUserId}
        />
        <MessageList
          headerHeightOffset={headerHeightOffset}
          setEditDetails={setEditDetails}
          messages={messages}
          mousePosition={position}
          conversationId={activeConversation?.conversation?.conversationId}
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
          getOlderMessages={(func) => activeConversation?.conversation?.conversationType !== "broadcast-chat"? getOlderMessages(func) : null}
        />
        <ChatInput
          closeGeneralMenu={() => setMenuDetails({ element: null })}
          generalMenuRef={generalMenuRef}
          setMenuDetails={setMenuDetails}
          menuDetails={menuDetails}
          setEditDetails={setEditDetails}
          editProps={editDetails as any}
          recipientId={recipientId}
          conversationId={activeConversation?.conversation?.conversationId}
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
      style={{
        background: theme?.background?.primary,
        height: `calc(100vh - ${headerHeightOffset}px)`,
      }}
      className={styles.chat}
    >
      <div className={`${styles.chat__conversations}`}>
        <Navbar
          chatUser={user}
          userList={userList}
          renderNavbar={props.renderNavbar}
          activeView={view}
          onViewChanged={(value) => setView(value)}
          connectionStatus={connectionStatus}
          enableBroadcasts={enableBroadcasts}
        />
        {view === "conversation-list" ? (
          <MainList
            resetState={resetState}
            connectionStatus={connectionStatus}
            setShowUserList={setShowUserList}
            showUserList={showUserList}
            setMainListOpen={setMainListOpen}
            userListRef={userListRef}
            renderConversationList={props.renderConversationList}
          />
        ):(
          <BroadcastLists 
            onCreateBroadcastList={onCreateBroadcastList}
          />
        )}
      </div>
      {activeConversation ? (
        <div className={styles.chat__messages}>
          <ChatTopNav
            setMainListOpen={setMainListOpen}
            renderChatHeader={props.renderChatHeader}
            onClose={resetState}
            chatUserId={chatUserId}
          />
          <MessageList
            headerHeightOffset={headerHeightOffset}
            setEditDetails={setEditDetails}
            messages={messages}
            mousePosition={position}
            conversationId={activeConversation?.conversation?.conversationId}
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
            getOlderMessages={(func) => getOlderMessages(func)}
          />
          <ChatInput
            closeGeneralMenu={() => setMenuDetails({ element: null })}
            generalMenuRef={generalMenuRef}
            setMenuDetails={setMenuDetails}
            menuDetails={menuDetails}
            setEditDetails={setEditDetails}
            editProps={editDetails as any}
            recipientId={recipientId}
            conversationId={activeConversation?.conversation?.conversationId}
            client={client}
            recipientTyping={recipientTyping}
            textInputRef={textInputRef}
            renderChatInput={props.renderChatInput}
          />
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <ChatIcon color={theme.icon} size={100} />
          <p style={{ marginTop: "30px", color: theme.text.secondary }}>
            Select a conversation to get started
          </p>
        </div>
      )}
      {showImageModal.length > 0 && <ImageViewer />}
    </div>
  );
};

export default Chat;
