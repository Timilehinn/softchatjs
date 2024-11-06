import React, { createContext, useContext, useEffect } from "react";
import { ChatTheme, Config } from "../types";
import ModalProvider from "./ModalProvider";
import ChatClient from "softchatjs-core";
import defaultTheme from "../theme";
import { MessageStateProvider } from "./MessageStateContext";

type ChatProvider = {
  children: JSX.Element,
  // subId: string,
  // projectId: string,
  theme?: ChatTheme
}

const ConfigContext = createContext<Omit<ChatProvider, 'children'> & { client: ChatClient | null }>({
  theme: defaultTheme,
  client: null
});

export function useConfig() {
  return useContext(ConfigContext);
}

export default function ChatProvider(props: ChatProvider & { client: ChatClient | null }) {

  const { children, client, theme = defaultTheme } = props;
  
  return (
    <ConfigContext.Provider value={{ theme, client }}>
      {/* <ConnectionProvider projectId={config.projectId}>
        <ChatClientProvider> */}
        <MessageStateProvider>
          <ModalProvider>
          {/* <MessageProvider> */}
            {children}
          {/* </MessageProvider> */}
          </ModalProvider>
        </MessageStateProvider>
        {/* </ChatClientProvider> */}
      {/* </ConnectionProvider> */}
    </ConfigContext.Provider>
  )
}