import { createContext, useContext } from "react";
import ChatClient from "softchatjs-core/src";

type ChatClientConfigType = {
  apiKey: string;
  projectId: string;
  userId: string;
  username: string;
  theme?: {
    background: {
      primary?: string; // White background for light mode
      secondary?: string; // Light grey for secondary background
      disabled?: string;
    };
    text?: {
      primary?: string; // Black text for high contrast
      secondary?: string; // Dark grey for secondary text
      disabled?: string; // Light grey for disabled text
    };
    action?: {
      primary?: string; // Dark teal for primary action buttons
      secondary?: string; // Light teal for secondary action buttons
    };
    chatBubble?: {
      left?: {
        bgColor?: string; // Light grey for incoming message background
        messageColor?: string; // Dark grey for incoming message text
        messageTimeColor?: string; // Medium grey for message time
        replyBorderColor?: string;
      };
      right?: {
        bgColor: string; // Light teal for outgoing message background
        messageColor: string; // Black for outgoing message text
        messageTimeColor: string; // Medium grey for message time
        replyBorderColor: string;
      };
    };
    icon?: string; // Dark grey for icons
    divider?: string; // Light grey for dividers
  } | null;
};

type ContexType = {
  config: ChatClientConfigType;
  client: ChatClient;
};

export const ChatClientContext = createContext<ContexType>({
  config: { apiKey: "", projectId: "", userId: "", username: "", theme: null },
  client: null as any,
});

export const useChatClient = () => useContext(ChatClientContext);

export const ChatClientProvider = ({
  config,
  children,
}: {
  children: JSX.Element;
  config: ChatClientConfigType;
}) => {
  const client = ChatClient.getInstance({
    apiKey: config.apiKey,
    projectId: config.projectId,
  });

  client.initializeUser({
    uid: config.userId,
    username: config.username,
    profileUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiBNx0Gn_wuUhj9u7ncTMf31YGgCg9JBM3Hg&s",
  });

  return (
    <ChatClientContext.Provider value={{ config, client }}>
      {children}
    </ChatClientContext.Provider>
  );
};
