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
   /**
   * Multiplier to adjust the font size dynamically.
   * A value of 1 keeps the default size, while values like 0.5 or 1.5 scale it down or up.
  */
   fontScale?: number
};

const ConfigContext = createContext<
  Omit<ChatProvider, "children"> & { client: ChatClient | null }
>({
  theme: defaultTheme,
  client: null,
  fontFamily: undefined,
  fontScale: 1
});

export function useConfig() {
  return useContext(ConfigContext);
}

export default function ChatProvider(
  props: ChatProvider & { client: ChatClient | null }
) {
  const { children, client, theme = defaultTheme, fontFamily, fontScale } = props;

  return (
    <ConfigContext.Provider value={{ theme, client, fontFamily, fontScale }}>
      <MessageStateProvider>
        <ModalProvider>{children}</ModalProvider>
      </MessageStateProvider>
    </ConfigContext.Provider>
  );
}
