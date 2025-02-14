import { createContext, useContext } from "react";
import ChatClient from "softchatjs-core";


export const AppProviderContext = createContext<{ client: ChatClient | null }>({
  client: null,
});

export const useAppProvider = () => useContext(AppProviderContext);

export const AppProvider = ({
  children,
  client
}: {
  children: JSX.Element;
  client: ChatClient | null
}) => {

  return (
    <AppProviderContext.Provider value={{ client }}>
      {children}
    </AppProviderContext.Provider>
  );
};
