import React, { useState, useRef, createContext, useEffect, useContext } from "react";
import * as Linking from "expo-linking";
import ChatClient from "softchatjs-core";
import { Children } from "softchatjs-react-native";
import { registerForPushNotificationsAsync } from "@/utils/NotificationUtils";

export type ClientContextType = {
  client: ChatClient | null
}

const ClientContext = createContext<ClientContextType & { expoPushToken: string | undefined | null }>({
  client: null,
  expoPushToken: null
});

export const useClient = () => useContext<ClientContextType & { expoPushToken: string | undefined | null }>(ClientContext)

function ClientContextApi(props: ClientContextType & { children: Children }) {

  const [ expoPushToken, setExpoPushToken ] = useState<string | undefined | null>(null);

  useEffect(() => {
    (async () => {
      const token = await registerForPushNotificationsAsync();
      if(token){
        setExpoPushToken(token);
      } 
    })()
  },[])

  const { client } = props;

  return (
    <ClientContext.Provider value={{ client, expoPushToken }}>
      {props.children}
    </ClientContext.Provider>
  );
}

export default ClientContextApi;
