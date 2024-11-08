import React, { useState, useRef, createContext, useEffect, useContext } from "react";
import * as Linking from "expo-linking";
import ChatClient from "softchatjs-core";
import { Children } from "softchatjs-react-native";

export type ClientContextType = {
  client: ChatClient | null
}

const ClientContext = createContext<ClientContextType>({
  client: null
});

export const useClient = () => useContext<ClientContextType>(ClientContext)

function ClientContextApi(props: ClientContextType & { children: Children }) {

  const { client } = props;

  return (
    <ClientContext.Provider value={{ client }}>
      {props.children}
    </ClientContext.Provider>
  );
}

export default ClientContextApi;
