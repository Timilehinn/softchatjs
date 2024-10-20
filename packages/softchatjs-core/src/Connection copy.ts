// import ChatClient from "./ChatClient";
// import MessageClient from "./MessageClient";
// import {
//   CREATE_SESSION,
//   GET_CONVERSATIONS,
//   GET_EMOJIS,
//   GET_MESSAGES,
//   UPLOAD_MEDIA,
// } from "./fetch";
// import {
//   Config,
//   Conversation,
//   ConversationListMeta,
//   ConversationMap,
//   EditedMessage,
//   Message,
//   MessageStates,
//   Reaction,
//   Screens,
//   ServerActions,
//   UserMeta,
//   WsAccessConfig,
// } from "./types";
// import WebSocket from "isomorphic-ws";
// import EventEmitter from "events";
// import { Events } from "./events";
// import { Emoticon } from "./emoticon.type";
// import moment from 'moment'
// // import Socket from "./Socket";

// export default class Connection extends EventEmitter {
//   private static connection: Connection;
//   connecting: boolean;
//   socket: WebSocket | null;
//   conversations: Array<Conversation>;
//   conversationMap: ConversationMap;
//   wsConnected: boolean;
//   wsAccessConfig: WsAccessConfig;
//   fetchingConversations: boolean;
//   retry_delay_ms: number;
//   max_retry_count: number;
//   health_check_interval: number;
//   retry_count: number;
//   userMeta: UserMeta;
//   projectConfig: Config;
//   activeConversationId: string;
//   screen: Screens;
//   conversationListMeta: ConversationListMeta;
//   private healthCheckRef: NodeJS.Timeout | undefined;

//   constructor(client_instance: ChatClient) {
//     super();
//     this.connecting = false;
//     this.socket = null;
//     this.conversations = [];
//     this.conversationMap = {};
//     this.conversationListMeta = {};
//     this.wsConnected = false;
//     this.wsAccessConfig = { url: "", token: "" };
//     this.fetchingConversations = false;
//     this.retry_delay_ms = 5000;
//     this.max_retry_count = 5;
//     this.health_check_interval = 30000;
//     this.retry_count = 0;
//     this.userMeta = client_instance.userMeta;
//     this.projectConfig = {
//       projectId: client_instance.projectId,
//       apiKey: client_instance.apiKey,
//     },
//     this.activeConversationId = "";
//     this.screen = Screens.CONVERSATIONS;
//     this.healthCheckRef = undefined;
//   }

//   static getInstance(client_instance: ChatClient) {
//     if (Connection.connection) {
//       return Connection.connection;
//     }
//     Connection.connection = new Connection(client_instance);
//     return Connection.connection;
//   }

//   async _initiateConnection() {
//     try {
      
//       if (!this.userMeta.uid) return null;
//       clearInterval(this.healthCheckRef);
//       const res = await CREATE_SESSION<{ token: string; wsURI: string }>({
//         userId: this.userMeta.uid,
//         projectId: this.projectConfig.projectId,
//         apiKey: this.projectConfig.apiKey,
//       });
//       this.emit(Events.CONNECTION_CHANGED, {
//         connecting: true,
//         isConnected: false,
//         fetchingConversations: true,
//       });
//       console.log(res);
//       if (res.success) {
//         this.wsAccessConfig = {
//           url: res.data.wsURI,
//           token: res.data.token,
//         };
//         await this._getConversations({
//           token: res.data.token,
//           userId: this.userMeta.uid,
//         });
//         var message = JSON.stringify({
//           from: this.userMeta.uid,
//           to: "",
//           action: ServerActions.INITIALIZE,
//           userMeta: { ...this.userMeta, expoPushToken: "" },
//           newConversation: true,
//           recipientMeta: {},
//           projectId: this.projectConfig.projectId,
//         });
//         if (this.socket && this.socket?.readyState === WebSocket.OPEN) {
//           console.log("already socket opened");
//           this.socket.send(message); // send a message
//           this.wsConnected = true;
//           this.emit(Events.CONNECTION_CHANGED, {
//             connecting: false,
//             isConnected: true,
//             fetchingConversations: false,
//           });
//         } else {
//           var ws = new WebSocket(
//             `wss://${this.wsAccessConfig.url || res.data.wsURI}`
//           );
//           ws.onerror = (error: any) => {
//             console.log(":::socket error:::");
//             console.log(":::socket error:::", error);

//             if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
//               ws.close(); 
//             }
        
//             setTimeout(() => {
//               console.log("Retrying connection...");
//               this._initiateConnection(); // Re-attempt to connect
//             }, 3000);
//           }
//           ws.onopen = () => {
//             console.log("socket opened");
//             this.socket = ws;
//             ws.send(message); // send a message
//             this.wsConnected = true;
//             this.setupEventHandlers();
//             this.startHealthCheck();
//             this.connecting = false;
//             this.emit(Events.CONNECTION_CHANGED, {
//               connecting: false,
//               isConnected: true,
//               fetchingConversations: false,
//             });
//             this.emit(Events.CONVERSATION_LIST_CHANGED, {
//               conversations: this.conversations,
//             });
//           };
//         }
//       } else {
//         this.wsConnected = false;
//         this.emit(Events.CONNECTION_CHANGED, {
//           connecting: false,
//           isConnected: false,
//           fetchingConversations: false,
//         });
//       }
//     } catch (error) {
//       console.log(error);
//       this.wsConnected = false;
//       this.emit(Events.CONNECTION_CHANGED, {
//         connecting: false,
//         isConnected: false,
//         fetchingConversations: false,
//       });
//     } finally {
//     }
//   }

//   private sortMesssages(messages: Array<Message>) {
//     var sorted = messages.sort((a, b) => {
//       const dateA = new Date(a.createdAt).getTime();
//       const dateB = new Date(b.createdAt).getTime();
//       return dateB - dateA;
//     });
//     return sorted
//   }

//   private sortConversationMessages(data: Conversation[]): Conversation[] {
//     return data.map((conversation) => {
//       const sortedMessages = [...conversation.messages].sort((a, b) => {
//         const dateA = moment(a.createdAt).valueOf();
//         const dateB = moment(b.createdAt).valueOf();
//         return dateA - dateB;
//       });
  
//       return { ...conversation, messages: sortedMessages };
//     });
//   }
  

//   private _getUreadMessageIds(messages: Array<Message>) {
//     var ids: string[] = [];
//     messages.map((m) => {
//       if (
//         m.messageState === MessageStates.SENT &&
//         m.from !== this.userMeta.uid
//       ) {
//         ids.push(m.messageId);
//       }
//     });
//     return ids;
//   }

//   private async _getConversations({
//     token,
//     userId,
//   }: {
//     token: string;
//     userId: string;
//   }) {
//     try {
//       this.fetchingConversations = true;
//       const response = await GET_CONVERSATIONS<{
//         conversations: Conversation[];
//       }>(token, userId);
//       if (response.success) {
//         const conversationListMeta: ConversationListMeta =
//           response.data.conversations.reduce((acc, conversation) => {
//             var sortedConversation = this.sortConversationMessages([conversation])
//             var messages = sortedConversation[0].messages
//             var lastMessage = messages[messages.length - 1]
           
//             acc[conversation.conversationId] = {
//               conversation: sortedConversation[0],
//               lastMessage: lastMessage,
//               unread: this._getUreadMessageIds(messages),
//             };
//             return acc;
//           }, {} as ConversationListMeta);
//         var conversationMap = response.data.conversations.reduce((acc, conversation) => {
//           acc[conversation.conversationId] = conversation;
//           return acc;
//         }, {} as ConversationMap);
//         this.conversationMap = conversationMap

//         this.emit(Events.CONVERSATION_LIST_META_CHANGED, {
//           conversationListMeta,
//         });
//         this.conversationListMeta = conversationListMeta;

//         // this.conversations = this.sortConversationMessages(
//         //   response.data.conversations
//         // );
//         this.conversations = response.data.conversations;
//       } else {
//         console.error("An error occurred while fetching conversations");
//       }
//     } catch (err) {
//       if (err instanceof Error) {
//         console.error("An error occurred while fetching conversations", err);
//       }
//     } finally {
//       this.fetchingConversations = false;
//     }
//   }

//   _wsDisconnect() {
//     if (this.socket) {
//       this.wsConnected = false;
//       const data = JSON.stringify({
//         action: ServerActions.CONNECTION_CLOSED,
//         message: {
//           projectId: this.projectConfig.projectId,
//           from: this.userMeta.uid,
//         },
//       });
//       this.socket.send(data); // send a message
//       this.socket.close();
//     }
//   }

//   private startHealthCheck() {
//     if (this.socket) {
//       if (this.healthCheckRef) {
//         clearInterval(this.healthCheckRef);
//         console.log(this.healthCheckRef, "---ref");
//       }

//       // Set the new interval
//       this.healthCheckRef = setInterval(() => {

//         // Check WebSocket connection status
//         if (this.socket?.readyState === WebSocket.OPEN) {
//           console.log("--Sending health check...");
//           const data = JSON.stringify({
//             action: ServerActions.HEALTH_CHECK,
//             message: {
//               message: "Hello!",
//               from: this.userMeta.uid,
//               token: this.wsAccessConfig.token,
//             },
//           });

//           this.socket.send(data); // send the health check message
//         }
//       }, 30000);
//     }
//   }

//   private setupEventHandlers() {
//     if (this.socket) {
//       this.socket.onmessage = (event: MessageEvent) => {
//         const msClient = MessageClient.getInstace(this, "");
//         msClient.messageEventHandler(event);
//       };

//       this.socket.onerror = (event: ErrorEvent) => {
//         console.error("Socket error: ", event);
//       };
//     }
//   }
// }
