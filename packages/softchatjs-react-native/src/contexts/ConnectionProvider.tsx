// import React, { createContext, useState, useContext, Dispatch, SetStateAction, useEffect, useCallback } from 'react';
// import { Conversation, Message, ReceivedAction, ServerActions, ClientActions, UserMeta, ReadMessages, WsPayLoad, IncomingMessage, Prettify, SetState, InitiateConnection } from '../types';
// import {generateConversationId, generateId} from '../utils';
// import { CREATE_SESSION, GET_CONVERSATIONS } from '../api';
// import { useConfig } from './ChatProvider';
// import { AppState, BackHandler, Platform } from 'react-native';

// type WsAccessConfig = {
//   url: string,
//   token: string
// }

// type ConnectionProviderContext = {
//   socket: WebSocket | null, 
//   setSocket: SetState<WebSocket | null>,
//   // conversations: Conversation[], 
//   // setConversations: SetState<Conversation[]>
//   initiateConnection: (params: InitiateConnection) => void;
//   wsConnected: boolean,
//   setWsConnected: SetState<boolean>
//   connecting: boolean,
//   setConnecting: SetState<boolean>,
//   wsAccessConfig: WsAccessConfig,
//   userMeta: UserMeta,
//   conversation: {
//     conversations: Conversation[],
//     isLoading: boolean,
//     setConversations: SetState<Conversation[]>
//   },
//   wsDiconnect: () => void;
// }

// const initialSocketContext: ConnectionProviderContext = {
//   socket: null,
//   setSocket: () => {},
//   // conversations: [],
//   // setConversations: () => {},
//   conversation: {
//     conversations: [],
//     isLoading: false,
//     setConversations: () => {}
//   },
//   initiateConnection: () => {},
//   wsConnected: false,
//   userMeta: { firstname: '', username: '', lastname: '', id: '' },
//   connecting: false,
//   setConnecting: () => {},
//   setWsConnected: () => {},
//   wsAccessConfig: { url: '', token: '' },
//   wsDiconnect: () => { }, // Placeholder function
// };

// export default initialSocketContext;

// // let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxOSIsImlhdCI6MTcxMTg0MjUyNCwiZXhwIjoxNzEyMTAxNzI0fQ.n_22VhbIPjBooSE8GnMU_s4Q9Qk6vwkJG5xA_o69TXI'

// const HEALTH_CHECK_INTERVAL = 30000;
// const ConnectionProviderContext = createContext<ConnectionProviderContext>(initialSocketContext);
// export const useConnection = () => useContext(ConnectionProviderContext);

// export const ConnectionProvider = ({ children, projectId }: { children: JSX.Element, projectId: string }) => {
//   const [ connecting, setConnecting ] = useState(false);
//   const [socket, setSocket] = useState<WebSocket | null>(null);
//   const [ conversations, setConversations] = useState<Conversation[]>([]);
//   const [ wsConnected, setWsConnected ] = useState(false);
//   const [ wsAccessConfig, setAccessWsConfig ] = useState<WsAccessConfig>({
//     url: '',
//     token: ''
//   });
//   const [userMeta, setUserMeta] = useState<UserMeta>(initialSocketContext.userMeta);
//   const [ fetchingConversations, setFetchingConversations ] = useState(false)

//   useEffect(()=>{
//     if(socket){
//       socket.onerror = (error) => {};
//     }
//   },[socket]);

//   function sortConversationMessages(conversations: Conversation[]): Conversation[] {
//     return conversations.map(conversation => {
//       const sortedMessages = conversation.messages.slice().sort((a, b) => {
//         const dateA = new Date(a.createdAt).getTime();
//         const dateB = new Date(b.createdAt).getTime();
//         return dateA - dateB;
//       });
//       return { ...conversation, messages: sortedMessages };
//     });
//   }

//   const getConversations = async ({ token, userId }:{ token: string, userId: string }) => {
//     try{
//       setFetchingConversations(true)
//       const response = await GET_CONVERSATIONS<{ conversations: Conversation[] }>(token, userId);
//       if(response.success){
        
//         setConversations(sortConversationMessages(response.data.conversations))
//       }else{
//         console.error('An error occurred while fetching conversations')

//       }
//     }catch(err){
//       if(err instanceof Error) {
//         console.error('An error occurred while fetching conversations', err)
//       }
//     }finally{
//       setFetchingConversations(false);
//     }
//   }

//   async function initiateConnection({
//     from,
//     to,
//     newConversation,
//     userDetails,
//     recipientMeta,
//   }: InitiateConnection) {
//     try {
//       console.log('shoudluse connection')
//       setConnecting(true)
//       const res = await CREATE_SESSION<{ token: string, wsURI: string }>({ userId: from });
//       console.log(res)
//       if(res.success){
//         setUserMeta(userDetails)
//         setAccessWsConfig({
//           url: res.data.wsURI,
//           token: res.data.token
//         });
//         await getConversations({ token: res.data.token, userId: from })
//         var message = JSON.stringify({ from, to, action: ServerActions.INITIALIZE, userMeta: { ...userDetails, expoPushToken: '' }, newConversation, recipientMeta, projectId })
//         if (socket?.readyState === WebSocket.OPEN) {
//           socket.send(message);  // send a message
//           setWsConnected(true);
//           await getConversations({ token: res.data.token, userId: from })
//           console.log('Socket already open')
//         } else {
//           var ws = new WebSocket(`wss://${wsAccessConfig.url || res.data.wsURI}`);
//           ws.onopen = () => {
//             setSocket(ws)
//             ws.send(message);  // send a message
//             setWsConnected(true);
//           };
//           console.log('New connection created')
//         }
//       }else{
//         setWsConnected(false);
//         console.error('initiateConnection failed')
//       }
//     } catch (error) {
//       console.log(error)
//       setWsConnected(false);
//       console.log(error)
//     } finally {
//       setConnecting(false)
//     }
//   }
  
//   const wsDiconnect = () => {
//     if (socket) {
//       setWsConnected(false);
//       console.log('Socket connection intentionally closed');
//       const data = JSON.stringify({
//         action: ServerActions.CONNECTION_CLOSED,
//         message: { projectId: projectId, from: userMeta.uid },
//       })
//       socket.send(data);  // send a message
//       socket.close();
//     }
//   }

//   useEffect(() => {
//     // const healthCheckRef = setInterval(() => {
//     //   if(socket?.readyState === WebSocket.OPEN){
//     //     console.log("--Sending health check...");
//     //     const data = JSON.stringify({
//     //       action: ServerActions.HEALTH_CHECK,
//     //       message: { message: 'Hello!', from: userMeta.uid },
//     //     })
//     //     socket.send(data);  // send a message
//     //   }
//     // }, HEALTH_CHECK_INTERVAL);

//     // return () => {
//     //   console.log('bkac')
//     //   wsDiconnect();
//     //   clearInterval(healthCheckRef)
//     // };
//   },[socket])

//   return (
//     <ConnectionProviderContext.Provider value={{
//       socket, 
//       setSocket,
//       // conversations,
//       // setConversations,
//       initiateConnection,
//       userMeta,
//       wsConnected,
//       connecting,
//       setConnecting,
//       setWsConnected,
//       wsAccessConfig,
//       conversation: {
//         isLoading: fetchingConversations,
//         conversations,
//         setConversations
//       },
//       wsDiconnect
//     }}>
//       {children}
//     </ConnectionProviderContext.Provider>
//   );
// };
