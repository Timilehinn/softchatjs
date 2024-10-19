import React, { createContext, useContext, useState } from "react";
import { Conversation, Media, Message } from "softchatjs-core";

type ConversationItem = {
  conversation: Conversation;
  lastMessage: Message;
  unread: string[];
};

type Context = {
  activeConversation: ConversationItem | null;
  setActiveConversation: React.Dispatch<
    React.SetStateAction<ConversationItem | null>
  >;
  conversations: ConversationItem[];
  setConversations: React.Dispatch<React.SetStateAction<ConversationItem[]>>;
  showImageModal: Media[];
  setShowImageModal: React.Dispatch<React.SetStateAction<Media[]>>;
};

export const ChatStateContext = createContext<Context>({
  activeConversation: null,
  setActiveConversation: () => {},
  conversations: [],
  setConversations: () => {},
  showImageModal: [],
  setShowImageModal: () => {},
});

export const useChatState = () => useContext(ChatStateContext);

export const ChatStateProvider = ({ children }: { children: JSX.Element }) => {
  const [activeConversation, setActiveConversation] =
    useState<ConversationItem | null>(null);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [showImageModal, setShowImageModal] = useState<Media[]>([]);

  return (
    <ChatStateContext.Provider
      value={{
        activeConversation,
        setActiveConversation,
        conversations,
        setConversations,
        showImageModal,
        setShowImageModal,
      }}
    >
      {children}
    </ChatStateContext.Provider>
  );
};
