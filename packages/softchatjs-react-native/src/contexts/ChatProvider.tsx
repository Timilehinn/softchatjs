import React, { createContext, useContext, useEffect } from "react";
import { ChatTheme, Config } from "../types";
import ModalProvider from "./ModalProvider";
import ChatClient from "softchatjs-core";
import defaultTheme from "../theme";
import { MessageStateProvider } from "./MessageStateContext";

type ChatProvider = {
  children: JSX.Element;
  theme?: ChatTheme;
  fontFamily: string | undefined;
};

const ConfigContext = createContext<
  Omit<ChatProvider, "children"> & { client: ChatClient | null }
>({
  theme: defaultTheme,
  client: null,
  fontFamily: undefined,
});

export function useConfig() {
  return useContext(ConfigContext);
}

export default function ChatProvider(
  props: ChatProvider & { client: ChatClient | null }
) {
  const { children, client, theme = defaultTheme, fontFamily } = props;

  return (
    <ConfigContext.Provider value={{ theme, client, fontFamily }}>
      <MessageStateProvider>
        <ModalProvider>{children}</ModalProvider>
      </MessageStateProvider>
    </ConfigContext.Provider>
  );
}
