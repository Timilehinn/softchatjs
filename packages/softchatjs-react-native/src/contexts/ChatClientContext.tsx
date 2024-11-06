// import React, {
//   createContext,
//   useState,
//   useContext,
//   useEffect,
//   useReducer,
// } from "react";
// import {
//   Conversation,
//   Message,
//   ServerActions,
//   ClientActions,
//   UserMeta,
//   ReadMessages,
//   WsPayLoad,
//   SetState,
//   StartConversation,
//   AttachmentTypes,
//   Point,
//   Media,
//   ConversationType,
//   Reaction,
//   MessageStates,
// } from "../types";
// import {
//   generateConversationId,
//   generateFillerTimestamps,
//   generateId,
// } from "../utils";
// import { useConnection } from "./ConnectionProvider";
// import { Emoticon } from "../components/Chat/EmojiSheet/type";

// type EditedMessage = { from: string, to: string, conversationId: string, messageId: string, textMessage: string, shouldEdit: boolean }

// type ChatClientContext = {
//   connecting: boolean;
//   wsConnected: boolean;
//   retryConnection: () => void;
//   userMeta: UserMeta | null;
//   startConversation: (data: StartConversation) => void;
//   setCurrentUser: (user: UserMeta) => void;
//   createConnection: (user: UserMeta, recipient: UserMeta) => void;
//   messageBody: MessageBody;
//   setTextMessage: (message: string) => void;
//   setAttachedMedia: (media: Media[]) => void;
//   setSharedLocation: (point: Point) => void;
//   setAttachmentType: (attachmentType: AttachmentTypes) => void;
//   setMessageBody: (messageBody: MessageBody) => void;
//   createMessage: (message: Message) => void;
//   editMessage: (message: EditedMessage) => void;
//   conversationsWithTypingIndicators: ConversationWithTypingIndicator[];
//   setScreen: SetState<Screens>,
//   sendReadNotification: (params: ReadMessages) => void;
//   clearUserUnreadNotifications: (conversationId: string, ids: string[]) => void;
//   stickers: Emoticon[],
//   setStickers: SetState<Emoticon[]>,
//   updateMessageReactions: (conversationId: string, messageId: string, reactions: Reaction[]) => void;
//   sendTypingNotification: (uid: string, conversationId: string) => void;
//   getConversationActivity: (conversationId: string) => { isUserOnline: boolean, isUserTyping: boolean }
//   globalTextMessage: string,
//   setGlobalTextMessage: SetState<string>,
//   activeConversationId: string, 
//   setActiveConversationId: SetState<string>
// };

// const initialChatClientContext: ChatClientContext = {
//   connecting: false,
//   wsConnected: false,
//   retryConnection: () => {},
//   userMeta: {
//     firstname: "",
//     username: "",
//     lastname: "",
//     email: "",
//     id: "",
//     phone: "",
//   },
//   startConversation: () => {},
//   setCurrentUser: () => {},
//   createConnection: () => {},
//   messageBody: {
//     messageText: "",
//     attachedMedia: [],
//     sharedLocation: {
//       lng: 0,
//       lat: 0,
//     },
//     attachmentType: AttachmentTypes.NONE,
//   },
//   conversationsWithTypingIndicators: [], // Initial empty array
//   setTextMessage: (message: string) => {},
//   setAttachedMedia: (media: Media[]) => {},
//   setSharedLocation: (point: Point) => {},
//   setAttachmentType: (attachmentType: AttachmentTypes) => {},
//   setMessageBody: (messageBody: MessageBody) => {},
//   createMessage: (message: Message) => {},
//   editMessage: (message: Message) => {},
//   setScreen: () => { },
//   sendReadNotification: (params) => { }, 
//   clearUserUnreadNotifications: (conversationId: string, ids: string[]) => {},
//   stickers: [],
//   setStickers: () => {},
//   updateMessageReactions: (conversationId: string, messageId: string, reactions: Reaction[]) => {},
//   sendTypingNotification: (uid: string, conversationId: string) => {},
//   getConversationActivity: (conversationId: string) => {},
//   globalTextMessage: '',
//   setGlobalTextMessage: () => {},
//   activeConversationId: '', 
//   setActiveConversationId: () => {}
// }

// export default initialChatClientContext;

// const ChatClientContext = createContext<ChatClientContext>(
//   initialChatClientContext
// );
// export const useChatClient = () => useContext(ChatClientContext);

// export type MessageBody = {
//   messageText: string;
//   attachedMedia: Media[];
//   sharedLocation: Point | null;
//   attachmentType: AttachmentTypes;
// };

// const initialMessageBodyState: MessageBody = {
//   messageText: "",
//   attachedMedia: [],
//   sharedLocation: null,
//   attachmentType: AttachmentTypes.NONE,
// };

// export enum MessageReducerActions {
//   SET_MESSAGE_TEXT = "set_messageText",
//   SET_ATTACHED_MEDIA = "set_attachedMedia",
//   SET_SHARED_LOCATION = "set_sharedLocation",
//   SET_ATTACHMENT_TYPE = "set_attachmentType",
//   SET_MESSAGE_BODY = "set_messageBody",
// }

// type Reducer<T, PayloadT> = {
//   type: T;
//   payload: PayloadT;
// };

// type ConversationWithTypingIndicator = {
//   conversationId: string;
//   timer: NodeJS.Timeout;
//   timeActive: Date | string;
// };

// export enum Screens {
//   CHAT = "chat",
//   CONVERSATIONS = "conversations",
// }

// let CLEAR_UNREAD_TIMEOUT = 1500;

// export const ChatClientProvider = ({ children }: { children: JSX.Element }) => {
//   const {
//     conversation,
//     wsConnected,
//     setWsConnected,
//     socket,
//     userMeta,
//     initiateConnection,
//     connecting,
//     setConnecting,
//   } = useConnection();
//   const [
//     conversationsWithTypingIndicators,
//     setConversationsWithTypingIndicators,
//   ] = useState<ConversationWithTypingIndicator[]>([]);
//   const [activeConversations, setActiveConversations] = useState<
//     ConversationWithTypingIndicator[]
//   >([]);
//   const RETRY_DELAY_MS = 5000;
//   const MAX_RETRY_COUNT = 5;
//   const [retryCount, setRetryCount] = useState(0);
//   var userId = userMeta?.id as string;
//   const [ screen, setScreen ] = useState<Screens>(Screens.CONVERSATIONS);
//   const [ activeConversationId, setActiveConversationId ] = useState('')
//   const [ stickers, setStickers ] = useState<Emoticon[]>([]);
//   const [ globalTextMessage, setGlobalTextMessage ] = useState('')

//   const messageReducer = (
//     state: MessageBody,
//     action: Reducer<MessageReducerActions, any>
//   ) => {
//     switch (action.type) {
//       case MessageReducerActions.SET_MESSAGE_TEXT:
//         return { ...state, messageText: action.payload };
//       case MessageReducerActions.SET_ATTACHED_MEDIA:
//         return { ...state, attachedMedia: action.payload };
//       case MessageReducerActions.SET_SHARED_LOCATION:
//         return { ...state, sharedLocation: action.payload };
//       case MessageReducerActions.SET_ATTACHMENT_TYPE:
//         return { ...state, attachmentType: action.payload };
//       case MessageReducerActions.SET_MESSAGE_BODY:
//         return { ...state, ...action.payload };
//       default:
//         return state;
//     }
//   };

//   const [messageBody, reducer] = useReducer(
//     messageReducer,
//     initialMessageBodyState
//   );

//   const setTextMessage = (message: string) => {
//     reducer({
//       type: MessageReducerActions.SET_MESSAGE_TEXT,
//       payload: message,
//     });
//   }

//   const setAttachedMedia = (media: Media[]) => {
//     return reducer({
//       type: MessageReducerActions.SET_ATTACHED_MEDIA,
//       payload: media,
//     });
//   };

//   const setSharedLocation = (point: Point) => {
//     return reducer({
//       type: MessageReducerActions.SET_SHARED_LOCATION,
//       payload: point,
//     });
//   };

//   const setAttachmentType = (attachmentType: AttachmentTypes) => {
//     return reducer({
//       type: MessageReducerActions.SET_ATTACHMENT_TYPE,
//       payload: attachmentType,
//     });
//   };

//   const setMessageBody = (messageBody: MessageBody) => {
//     return reducer({
//       type: MessageReducerActions.SET_MESSAGE_BODY,
//       payload: messageBody,
//     });
//   };

//   function createConnection(user: UserMeta, recipient: UserMeta) {
//     // setUserMeta(user);
//     initiateConnection({
//       from: user.id,
//       to: recipient.id,
//       newConversation: false,
//       userDetails: user,
//       recipientMeta: recipient,
//     });
//   }

//   function retryConnection() {
//     if (socket?.readyState !== WebSocket.OPEN) {
//       if (retryCount < MAX_RETRY_COUNT) {
//         console.info("Retrying connection...");
//           if (userMeta) {
//             initiateConnection({
//               from: userId,
//               to: "",
//               newConversation: false,
//               userDetails: userMeta,
//               recipientMeta: {
//                 username: "",
//                 id: "",
//                 email: "",
//                 firstname: "",
//                 lastname: "",
//               },
//             });
//           }
//         setRetryCount(retryCount + 1);
//       } else {
//         console.error(
//           "Maximum retry count reached. Unable to establish WebSocket connection."
//         );
//       }
//     }
//   }

//   const wsDiconnect = () => {
//     if (socket) {
//       socket.close();
//     }
//   };

//   const wsOnError = (error: CloseEvent) => {
//     setWsConnected(false);
//     console.error("WebSocket error:", error);
//     retryConnection();
//   };

//   // useEffect(() => {
//   //   if(socket?.readyState !== WebSocket.OPEN) {
//   //     retryConnection()
//   //   }
//   // },[socket])

//   const setCurrentUser = (user: UserMeta) => {
//     // setUserMeta(user);
//   };

//   const sendNewMesssage = (data: StartConversation, chatToken: string) => {
//     // if (socket) {
//     //   const conversationId = generateConversationId(
//     //     userId,
//     //     data.recipientMeta?.id
//     //   );
//     //   const messageId = generateId();
//     //   const conversationExists = conversation.conversations.find(
//     //     (conversation) => conversation.conversationId === conversationId
//     //   );
//     //   if (conversationExists) {
//     //     conversation.setConversations((prevConversations: Conversation[]) => {
//     //       return prevConversations.map((conversation) => {
//     //         if (conversation.conversationId === conversationId) {
//     //           return {
//     //             ...conversation,
//     //             messages: [
//     //               ...conversation.messages,
//     //               {
//     //                 conversationId,
//     //                 from: userId as string,
//     //                 to: data.recipientMeta?.id,
//     //                 message: data.message,
//     //                 messageState: 1,
//     //                 messageId,
//     //                 attachedMedia: [],
//     //                 createdAt: new Date(),
//     //                 updatedAt: new Date(),
//     //                 messageOwner: {
//     //                   uid: userId,
//     //                   connectionId: "--",
//     //                   projectId: "--",
//     //                   meta: userMeta,
//     //                   ...generateFillerTimestamps(),
//     //                 },
//     //               },
//     //             ],
//     //           };
//     //         } else {
//     //           return conversation;
//     //         }
//     //       });
//     //     });
//     //   } else {
//     //     conversation.setConversations([
//     //       {
//     //         participants: [userId, data.recipientMeta?.id],
//     //         admins: [],
//     //         meta: null,
//     //         conversationType: "private-chat",
//     //         groupMeta: null,
//     //         conversationId,
//     //         messages: [
//     //           {
//     //             messageId,
//     //             from: userId,
//     //             messageState: 1,
//     //             attachedMedia: [],
//     //             conversationId,
//     //             to: data.recipientMeta?.id,
//     //             message: data.message,
//     //             createdAt: new Date(),
//     //             updatedAt: new Date(),
//     //             messageOwner: {
//     //               uid: userId,
//     //               connectionId: "--",
//     //               projectId: "--",
//     //               meta: userMeta,
//     //               ...generateFillerTimestamps(),
//     //             },
//     //           },
//     //         ],
//     //         participantList: [
//     //           {
//     //             id: generateId(),
//     //             uid: userId,
//     //             connectionId: "--",
//     //             projectId: "",
//     //             participantId: userId,
//     //             participantDetails: {
//     //               uid: userId,
//     //               connectionId: "--",
//     //               projectId: "--",
//     //               meta: {
//     //                 id: userId,
//     //                 username: userMeta?.username,
//     //               },
//     //               ...generateFillerTimestamps(),
//     //             },
//     //             createdAt: new Date(),
//     //             updatedAt: new Date(),
//     //           },
//     //           {
//     //             id: generateId(),
//     //             uid: data.recipientMeta?.id,
//     //             connectionId: "--",
//     //             projectId: "--",
//     //             participantId: data.recipientMeta?.id,
//     //             participantDetails: {
//     //               uid: data.recipientMeta?.id,
//     //               connectionId: "--",
//     //               projectId: "--",
//     //               meta: {
//     //                 id: userId,
//     //                 username: "other-user-name",
//     //               },
//     //               ...generateFillerTimestamps(),
//     //             },
//     //             createdAt: new Date(),
//     //             updatedAt: new Date(),
//     //           },
//     //         ],
//     //         ...generateFillerTimestamps(),
//     //       },
//     //       ...conversation.conversations,
//     //     ]);
//     //   }
//     //   // socket.send(JSON.stringify({ action: ServerActions.SEND_MESSAGE, message: { messageId, messageType: 'text', from: userId, to: data.recipientMeta?.id, message: data.message, token: chatToken } }));
//     // }
//   };

//   const startConversation = async (data: StartConversation) => {
//     try {
//       const chatToken = localStorage.getItem("chatToken");
//       if (!chatToken)
//         throw new Error("Invalid session, please login and try again");
//       if (!data.message) throw new Error("Message is required");
//       if (socket) {
//         sendNewMesssage(data, chatToken);
//       } else {
//         initiateConnection({
//           from: userId,
//           to: data.recipientMeta.id,
//           newConversation: false,
//           userDetails: userMeta,
//           recipientMeta: {
//             username: "",
//             id: "",
//             email: "",
//             firstname: "",
//             lastname: "",
//           },
//         });
//       }
//     } catch (err) {
//       if (err instanceof Error) {
//         console.error(
//           "An error occurred while starting conversation: ",
//           err?.message
//         );
//       }
//     }
//   };

//   const createMessage = (newMessage: Message) => {
//     var timeStamps = generateFillerTimestamps();
//     let conversationId = newMessage.conversationId;
//     console.log(conversationId, '---the convers')
//     conversation.setConversations((prevConversations: Conversation[]) => {
//       const conversationIndex = prevConversations.findIndex(
//         (conversation) => conversation.conversationId === conversationId
//       );

//       // for group chat
//       if(conversationIndex !== -1 && conversation.conversations[conversationIndex].conversationType === 'group-chat'){
//         const updatedConversations = [...prevConversations];
//         updatedConversations[conversationIndex] = {
//           ...updatedConversations[conversationIndex],
//           messages: [
//             ...updatedConversations[conversationIndex].messages,
//             { ...newMessage, reactions: [], messageState: MessageStates.LOADING },
//           ],
//         };
//         return updatedConversations;
//       }

//       if (conversationIndex !== -1) {
//         const updatedConversations = [...prevConversations];
//         updatedConversations[conversationIndex] = {
//           ...updatedConversations[conversationIndex],
//           messages: [
//             ...updatedConversations[conversationIndex].messages,
//             { ...newMessage, reactions: [], messageState: MessageStates.LOADING },
//           ],
//         };
//         return updatedConversations;
//       } else {
//         const conversationType = conversation.conversations[conversationIndex].conversationType
//         // If the conversation does not exist, create a new conversation object
//         return [
//           ...prevConversations,
//           {
//             // participants: conversationType === 'private-chat'?  [newMessage.from, newMessage.to] : conversation.conversations[conversationIndex].participants,
//             participants: [newMessage.from, newMessage.to],
//             admins: [newMessage.from, newMessage.to],
//             conversationId,
//             recipientId: newMessage.to,
//             messages: [newMessage],
//             conversationType: 'private-chat',
//             messageState: MessageStates.LOADING,
//             participantList: [
//               {
//                 id: generateId(),
//                 uid: userId,
//                 connectionId: "--",
//                 projectId: "",
//                 participantId: userId,
//                 participantDetails: {
//                   uid: userId,
//                   connectionId: "--",
//                   projectId: "--",
//                   meta: {
//                     id: userId,
//                     username: userMeta?.username,
//                   },
//                   ...timeStamps,
//                 },
//                 createdAt: new Date(),
//                 updatedAt: new Date(),
//               },
//               {
//                 id: generateId(),
//                 uid: newMessage.to,
//                 connectionId: "--",
//                 projectId: "--",
//                 participantId: newMessage.to,
//                 participantDetails: {
//                   uid: newMessage.to,
//                   connectionId: "--",
//                   projectId: "--",
//                   meta: {
//                     id: userId,
//                     username: "other-user-name",
//                   },
//                   ...timeStamps,
//                 },
//                 createdAt: new Date(),
//                 updatedAt: new Date(),
//               },
//             ],
//             meta: null,
//             groupMeta: null,
//             ...timeStamps,
//           },
//         ];
//       }
//     });
//   };

//   const editMessage = (message: EditedMessage) => {
//     let conversationId = message.conversationId;
//     let messageId = message.messageId;
//     console.log(conversationId, '---the convers to edit');
//     conversation.setConversations((prevConversations: Conversation[]) => {
//       const conversationIndex = prevConversations.findIndex(
//         (conversation) => conversation.conversationId === conversationId
//       );
//       // for group chat
//       if (conversationIndex !== -1 && conversation.conversations[conversationIndex].conversationType === 'group-chat') {
//         const updatedConversations = [...prevConversations];
//         const messages = [...updatedConversations[conversationIndex].messages];
//         const messageIndex = messages.findIndex(msg => msg.messageId === messageId);
      
//         if (messageIndex !== -1) {
//           // Update the message with the matching messageId
//           messages[messageIndex] = {
//             ...messages[messageIndex],
//             message: message.textMessage,
//             lastEdited: new Date()
//           };
      
//           // Update the conversations array with the updated messages array
//           updatedConversations[conversationIndex] = {
//             ...updatedConversations[conversationIndex],
//             messages: messages,
//           };
//           return updatedConversations;
//         }
//       }

//       if (conversationIndex !== -1) {
//         const updatedConversations = [...prevConversations];
//         const messages = [...updatedConversations[conversationIndex].messages];
//         const messageIndex = messages.findIndex(msg => msg.messageId === messageId);
//         if (messageIndex !== -1) {
//           // Update the existing message with the matching messageId
//           messages[messageIndex] = {
//             ...messages[messageIndex],
//             message: message.textMessage,
//             lastEdited: new Date()
//           };
      
//           // Update the conversations array with the updated messages array
//           updatedConversations[conversationIndex] = {
//             ...updatedConversations[conversationIndex],
//             messages: messages,
//           };
//           return updatedConversations;
//         }
//       }

//       return prevConversations
//     });
//     if(socket){
//       const socketMessage = {
//         action: ServerActions.EDIT_MESSAGE,
//         message
//       };
//       socket?.send(JSON.stringify(socketMessage))
//     }
//   };

//   const updateMessageReactions = (conversationId: string, messageId: string, reactions: Reaction[]) => {
//     conversation.setConversations((prevConversations: Conversation[]) => {
//       const conversationIndex = prevConversations.findIndex(
//         (conversation) => conversation.conversationId === conversationId
//       );
//       if (conversationIndex !== -1) {
//         const updatedConversations = [...prevConversations];
//         const conversation = updatedConversations[conversationIndex];
//         const updatedMessages = conversation.messages.map(message => {
//           if (message.messageId === messageId) {
//             // Update the selected message with reactions
//             return { ...message, reactions };
//           }
//           return message;
//         });
      
//         // Update the conversation with the updated messages
//         updatedConversations[conversationIndex] = {
//           ...conversation,
//           messages: updatedMessages,
//         };
      
//         return updatedConversations;  
//       }
//       return prevConversations
//     })
//   }

//   const updatedEditedMessage = (data: EditedMessage) => {
//     conversation.setConversations((prevConversations: Conversation[]) => {
//       const conversationIndex = prevConversations.findIndex(
//         (conversation) => conversation.conversationId === data.conversationId
//       );
//       if (conversationIndex !== -1) {
//         const updatedConversations = [...prevConversations];
//         const conversation = updatedConversations[conversationIndex];
//         const updatedMessages = conversation.messages.map(message => {
//           if (message.messageId === data.messageId) {
//             return { ...message, message: data.textMessage, lastEdited: new Date() };
//           }
//           return message;
//         });
//         // Update the conversation with the updated messages
//         updatedConversations[conversationIndex] = {
//           ...conversation,
//           messages: updatedMessages,
//         };
      
//         return updatedConversations;
//       }
//       return prevConversations
//     })
//   }
//   // ===========================================================

//   // Add the timeout to the map
//   const addNewTimer = (
//     callBack: (id: NodeJS.Timeout) => void,
//     duration: number
//   ) => {
//     const timeoutId = setTimeout(() => {
//       console.log(timeoutId, "--my timeout id");
//       callBack(timeoutId);
//     }, duration);
//     return timeoutId;
//   };


//   const updateTypingIndicatorList = (timer: NodeJS.Timeout) => {
//     var newList = conversationsWithTypingIndicators.filter(
//       (c) => c.timer !== timer
//     );
//     setConversationsWithTypingIndicators(newList);
//   };

//   const updateActiveConversationsList = (timer: NodeJS.Timeout) => {
//     var newList = activeConversations.filter((c) => c.timer !== timer);
//     setActiveConversations(newList);
//   };

//   const updateActiveConversations = (conversationId: string) => {
//     setActiveConversations((prev) => {
//       // Check if the conversationId already exists in the array
//       const existingConversation = prev.find(
//         (c) => c.conversationId === conversationId
//       );
//       if (existingConversation) {
//         // If the conversationId exists, update its timer and timeActive properties
//         clearTimeout(existingConversation.timer);
//         const updatedConversation = {
//           ...existingConversation,
//           timer: addNewTimer(updateActiveConversationsList, 10000),
//           timeActive: new Date(),
//         };
//         return prev.map((c) =>
//           c.conversationId === conversationId ? updatedConversation : c
//         );
//       } else {
//         // If the conversationId doesn't exist, add a new conversation to the array
//         const newConversation = {
//           conversationId,
//           timer: addNewTimer(updateActiveConversationsList, 10000),
//           timeActive: new Date(),
//         };
//         return [...prev, newConversation];
//       }
//     });
//   };

//   const showTypingIndicator = (conversationId: string) => {
//     setConversationsWithTypingIndicators((prev) => {
//       // Check if the conversationId already exists in the array
//       const existingConversation = prev.find(
//         (c) => c.conversationId === conversationId
//       );
//       if (existingConversation) {
//         // If the conversationId exists, update its timer and timeActive properties
//         clearTimeout(existingConversation.timer);
//         const updatedConversation = {
//           ...existingConversation,
//           timer: addNewTimer(updateTypingIndicatorList, 5000),
//           timeActive: new Date(),
//         };
//         return prev.map((c) =>
//           c.conversationId === conversationId ? updatedConversation : c
//         );
//       } else {
//         // If the conversationId doesn't exist, add a new conversation to the array
//         const newConversation = {
//           conversationId,
//           timer: addNewTimer(updateTypingIndicatorList, 5000),
//           timeActive: new Date(),
//         };
//         return [...prev, newConversation];
//       }
//     });

//     // Active chats
//     updateActiveConversations(conversationId);
//   };

//   const getConversationActivity = (conversationId: string) => {
//     const activeConversation = activeConversations.find(
//       (a) => a.conversationId === conversationId
//     );
//     const conversationWithTypingIndicator =
//       conversationsWithTypingIndicators.find(
//         (a) => a.conversationId === conversationId
//       );
//     var isUserOnline = activeConversation ? true : false;
//     var isUserTyping = conversationWithTypingIndicator ? true : false;
//     return { isUserOnline, isUserTyping };
//   };

//   // sent to message recipient
//   const sendTypingNotification = (uid: string, conversationId: string) => {
//     if (socket) {
//       socket.send(
//         JSON.stringify({
//           action: ServerActions.USER_TYPING,
//           message: { uid, conversationId },
//         })
//       );
//     }
//   };

//   const addMessageToConversation = (newMessage: Message, screen: string) => {
//     const userId = userMeta?.id.toString() as string; // Assuming userMeta is defined elsewhere
//     const updatedConversationList = conversation.conversations.map((c) => {
//       if (c.conversationId === newMessage.conversationId) {
//         // Find the index of the message to edit
//         const messageIndexToEdit = c.messages.findIndex(message => message.messageId === newMessage.messageId);
  
//         // if (newMessage.shouldEdit && messageIndexToEdit !== -1) {
//         //   // Edit existing message
//         //   const updatedMessages = [...c.messages];
//         //   updatedMessages[messageIndexToEdit] = {
//         //     ...updatedMessages[messageIndexToEdit],
//         //     ...newMessage,
//         //     messageState: screen === Screens.CHAT ? MessageStates.READ : MessageStates.SENT,
//         //   };
//         //   return { ...c, messages: updatedMessages };
//         // } else {
//           // Add new message
//           const updatedMessages = [
//             ...c.messages,
//             { ...newMessage, messageState: screen === Screens.CHAT ? MessageStates.READ : MessageStates.SENT },
//           ];
//           return { ...c, messages: updatedMessages };
//         // }
//       } else {
//         // Return the original conversation object if it's not the one being updated
//         return c;
//       }
//     });
  
//     conversation.setConversations(updatedConversationList);
//   };
  

//   const sendReadNotification = (data: ReadMessages) => {
//     if (socket) {
//       socket.send(
//         JSON.stringify({
//           action: ServerActions.READ_MESSAGES,
//           message: data,
//         })
//       );
//     }
//   };

//   //this is to clear notifications for user who hasn't opened chat
//   const clearUserUnreadNotifications = (
//     conversationId: string,
//     ids: string[]
//   ) => {
//     console.log({
//       conversationId,
//       ids
//     },'-----here erwad')
//     var updatedConversationList = conversation.conversations.map((c) => {
//       if (c.conversationId === conversationId) {
//         const updatedMessages = c.messages.map((msg) => {
//           if (ids.includes(msg.messageId)) {
//             return { ...msg, messageState: MessageStates.READ };
//           }
//           return msg;
//         });
//         return { ...c, messages: updatedMessages };
//       } else {
//         return c;
//       }
//     });
//     console.log('clearing unread messages')
//     conversation.setConversations(updatedConversationList);
//   };

//   useEffect(() => {
//     if (socket) {
//       socket.onmessage = (event) => {
//         var wsData = JSON.parse(event.data);
//         console.log(wsData, "--incoming");
//         const action: ClientActions | ServerActions = wsData.action;
//         console.log(activeConversationId, wsData?.message?.conversationId, '----the ')
//         if (screen === Screens.CHAT && activeConversationId === wsData?.message?.conversationId) {
//           // read messages if user is still on the screen
//           if (action === ClientActions.INCOMING_MESSAGE) {
//             const {
//               message: incomingMessagePayload,
//             }: WsPayLoad<ServerActions, Message> = JSON.parse(event.data);
//             sendReadNotification({
//               uid: incomingMessagePayload.from,
//               messageIds: [incomingMessagePayload.messageId],
//             });
//           }

//           if (action === ClientActions.MESSAGES_READ) {
//             const {
//               message: readMessagesPayload,
//             }: WsPayLoad<
//               ClientActions,
//               ReadMessages & { conversationId: string }
//             > = wsData;
//             const existingConversationForRead = conversation.conversations.find(
//               (e_conversation) =>
//                 e_conversation.conversationId ===
//                 readMessagesPayload.conversationId
//             );
//             if (existingConversationForRead && screen === Screens.CHAT && activeConversationId === readMessagesPayload.conversationId) {
//               setTimeout(() => {
//                 clearUserUnreadNotifications(
//                   readMessagesPayload.conversationId,
//                   readMessagesPayload.messageIds
//                 );
//               }, CLEAR_UNREAD_TIMEOUT);
//             }
//           }
//         }
//         switch (action) {
//           case ClientActions.MESSAGES_READ:
//             const {
//               message: readMessagesPayload,
//             }: WsPayLoad<
//               ClientActions,
//               ReadMessages & { conversationId: string }
//             > = wsData;
//             const existingConversationForRead = conversation.conversations.find(
//               (e_conversation) =>
//                 e_conversation.conversationId ===
//                 readMessagesPayload.conversationId
//             );
//             if (existingConversationForRead && screen === Screens.CHAT) {
//               setTimeout(() => {
//                 // if user reads message immediately, then they are online
//                 updateActiveConversations(readMessagesPayload.conversationId);
//                 clearUserUnreadNotifications(
//                   readMessagesPayload.conversationId,
//                   readMessagesPayload.messageIds
//                 );
//               }, CLEAR_UNREAD_TIMEOUT);
//             }
//             break;
//           case ClientActions.INCOMING_MESSAGE:
//             const {
//               message: incomingMessagePayload,
//             }: WsPayLoad<
//               ClientActions,
//               {
//                 message: Message;
//                 senderMeta: UserMeta;
//                 conversationType: ConversationType;
//               }
//             > = wsData;
//             var newMessage = incomingMessagePayload.message;

//             const existingConversation = conversation.conversations.find(
//               (e_conversation) =>
//                 e_conversation.conversationId === newMessage.conversationId
//             );
//             // clear typing indicator
//             const newActiveTypingIndicators =
//               conversationsWithTypingIndicators.filter(
//                 (c) => c.conversationId !== newMessage.conversationId
//               );
//             setConversationsWithTypingIndicators(newActiveTypingIndicators);
//             if (existingConversation) {
//               addMessageToConversation(newMessage, screen);
//             } else {
//               conversation.setConversations([
//                 {
//                   participants: [newMessage.from, newMessage.to],
//                   conversationId: generateConversationId(
//                     newMessage.from,
//                     newMessage.to
//                   ),
//                   messages: [
//                     {
//                       ...newMessage,
//                       messageId: generateId(),
//                       messageState: MessageStates.SENT,
//                       createdAt: new Date(),
//                     },
//                   ],
//                   admins: [newMessage.from],
//                   meta: null,
//                   groupMeta: null,
//                   conversationType: incomingMessagePayload.conversationType,
//                   participantList: [
//                     {
//                       id: generateId(),
//                       uid: newMessage.from,
//                       connectionId: "--",
//                       participantId: newMessage.from,
//                       projectId: "--",
//                       participantDetails: {
//                         projectId: "--",
//                         uid: userId,
//                         connectionId: "--",
//                         meta: incomingMessagePayload.senderMeta,
//                         ...generateFillerTimestamps(),
//                       },
//                       ...generateFillerTimestamps(),
//                     },
//                     {
//                       id: generateId(),
//                       uid: newMessage.to,
//                       connectionId: "--",
//                       participantId: newMessage.to,
//                       projectId: "--",
//                       participantDetails: {
//                         projectId: "--",
//                         uid: userMeta.uid,
//                         connectionId: "--",
//                         meta: userMeta,
//                         ...generateFillerTimestamps(),
//                       },
//                       ...generateFillerTimestamps(),
//                     },
//                   ],
//                   ...generateFillerTimestamps(),
//                 },
//                 ...conversation.conversations,
//               ]);
//             }
//             break;
//           case ClientActions.USER_IS_TYPING:
//             const {
//               message: userTypingPayload,
//             }: WsPayLoad<ClientActions, { conversationId: string }> = wsData;
//             showTypingIndicator(userTypingPayload.conversationId);
//             break;
//           case ClientActions.NEW_MESSAGE_REACTION:
//             const {
//               message: messageReactionPayload,
//             }: WsPayLoad<ClientActions, { conversationId: string, messageId: string, from: string, to: string, reactions: Reaction[] }> = wsData;
//             updateMessageReactions(messageReactionPayload.conversationId, messageReactionPayload.messageId, messageReactionPayload.reactions)
//             break
//           case ClientActions.MESSAGE_ERROR:
//             const {
//               message: errorPayload,
//             }: WsPayLoad<ClientActions, { error: string }> = wsData;
//             console.error(
//               "Failed to send message, please try again",
//               errorPayload
//             );
//             break;
//           case ClientActions.EDITED_MESSAGE:
//             const {
//               message: editedMessage,
//             }: WsPayLoad<ClientActions, EditedMessage> = wsData;
//             updatedEditedMessage(editedMessage)
//             break;
//           case ClientActions.ACK_HEALTH_CHECK:
//             console.info('HEALTH_CHECK: ok!');
//             break;
//           default:
//             console.log("Unknown action recieved");
//         }
//       };

//       socket.onerror = (error) => {
//         wsOnError(error);
//       };
//     }

//     // return () => {
//     //   wsDiconnect()
//     // };
//   }, [socket, screen, conversation.conversations]);
//   // ===========================================================

//   return (
//     <ChatClientContext.Provider
//       value={{
//         connecting,
//         wsConnected,
//         retryConnection,
//         userMeta,
//         startConversation,
//         setCurrentUser,
//         createConnection,
//         messageBody,
//         setTextMessage,
//         setAttachedMedia,
//         setSharedLocation,
//         setAttachmentType,
//         setMessageBody,
//         createMessage,
//         editMessage,
//         conversationsWithTypingIndicators,
//         setScreen,
//         sendReadNotification,
//         clearUserUnreadNotifications,
//         stickers, 
//         setStickers,
//         updateMessageReactions,
//         sendTypingNotification,
//         getConversationActivity,
//         globalTextMessage,
//         setGlobalTextMessage,
//         activeConversationId, 
//         setActiveConversationId
//       }}
//     >
//       {children}
//     </ChatClientContext.Provider>
//   );
// };
