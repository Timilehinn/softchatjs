import React, { createContext, useContext, useState } from "react";
import { Conversation, Media, Message } from "softchatjs-core";

export type ConversationItem = {
  conversation: Conversation;
  lastMessage: Message;
  unread: string[];
};

export type ConnectionStatus = { isConnected: boolean, fetchingConversations: boolean, connecting: boolean }

type Context = {
  activeConversation: ConversationItem | null;
  setActiveConversation: React.Dispatch<
    React.SetStateAction<ConversationItem | null>
  >;
  conversations: ConversationItem[];
  setConversations: React.Dispatch<React.SetStateAction<ConversationItem[]>>;
  showImageModal: Media[];
  setShowImageModal: React.Dispatch<React.SetStateAction<Media[]>>;
  connectionStatus: ConnectionStatus,
  setConnectionStatus: React.Dispatch<React.SetStateAction<ConnectionStatus>>;
};


export const ChatStateContext = createContext<Context>({
  activeConversation: null,
  setActiveConversation: () => {},
  conversations: [],
  setConversations: () => {},
  showImageModal: [],
  setShowImageModal: () => {},
  connectionStatus: { 
    isConnected: false,
    fetchingConversations: false,
    connecting: false
   },
   setConnectionStatus: () => {}
});

export const useChatState = () => useContext(ChatStateContext);

export const ChatStateProvider = ({ children }: { children: JSX.Element }) => {
  const [activeConversation, setActiveConversation] =
    useState<ConversationItem | null>(null);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [showImageModal, setShowImageModal] = useState<Media[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    fetchingConversations: false,
    connecting: false,
  });

  return (
    <ChatStateContext.Provider
      value={{
        activeConversation,
        setActiveConversation,
        conversations,
        setConversations,
        showImageModal,
        setShowImageModal,
        connectionStatus,
        setConnectionStatus
      }}
    >
      {children}
    </ChatStateContext.Provider>
  );
};
