import { createContext, useContext } from "react";
import ChatClient from "softchatjs-core";
import { ChatStateProvider } from "./clientStateProvider";
import { defaulTheme } from "../theme";
import { ReactTheme } from "../theme/type";

type ContextType = {
  config: { theme: ReactTheme },
  client: ChatClient | null;
};

export const ChatClientContext = createContext<ContextType>({
  config: { theme: defaulTheme },
  client: null,
});

export const useChatClient = () => useContext(ChatClientContext);

export const ChatClientProvider = ({
  theme,
  children,
  client
}: {
  theme?: ReactTheme
  children: JSX.Element;
  client: ChatClient | null
}) => {

  return (
    <ChatClientContext.Provider value={{ config: { theme: theme? theme : defaulTheme }, client }}>
      <ChatStateProvider>
        {children}
      </ChatStateProvider>
    </ChatClientContext.Provider>
  );
};
