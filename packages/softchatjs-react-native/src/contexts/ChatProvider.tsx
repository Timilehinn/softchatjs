// import { MessageProvider } from "./MessageContext";
// import { ChatClientProvider } from "./ChatClientContext";
import { ConnectionProvider } from "./ConnectionProvider";
import { createContext, useContext, useEffect } from "react";
import { ChatTheme, Config } from "../types";
import { ChatClientProvider } from "./ChatClientContext";
import ModalProvider from "./ModalProvider";
// import ChatClient from "softchatjs-core";
import ChatClient from "softchatjs-core/src";
import { Events } from "softchatjs-core/src/events";
import { Platform } from "react-native";
import { UserMeta } from "softchatjs-core/dist";
import defaultTheme from "../theme";
import { MessageStateProvider } from "./MessageStateContext";

type ChatProvider = {
  children: JSX.Element,
  apiKey: string,
  projectId: string,
  theme?: ChatTheme
}

const ConfigContext = createContext<Omit<ChatProvider, 'children'> & { client: ChatClient | null }>({
  apiKey: '',
  projectId: '',
  theme: defaultTheme,
  client: null
});

export function useConfig() {
  return useContext(ConfigContext);
}


export default function ChatProvider(props: ChatProvider) {


  const { children, apiKey, projectId, theme = defaultTheme } = props;

  const client = ChatClient.getInstance({ apiKey: apiKey, projectId: projectId });
  
  

  return (
    <ConfigContext.Provider value={{ apiKey, projectId, theme, client }}>
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