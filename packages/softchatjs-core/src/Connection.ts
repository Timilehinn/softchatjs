import ChatClient, { NotificationConfig } from "./ChatClient";
import MessageClient from "./MessageClient";
import {
  CREATE_SESSION,
  GET_BROADCASTLISTS,
  GET_CONVERSATIONS,
  GET_EMOJIS,
  GET_MESSAGES,
  UPLOAD_MEDIA,
} from "./fetch";
import {
  BroadcastListMeta,
  Config,
  Conversation,
  ConversationListMeta,
  ConversationMap,
  EditedMessage,
  Message,
  MessageStates,
  Reaction,
  Screens,
  ServerActions,
  UserMeta,
  WsAccessConfig,
} from "./types";
import WebSocket from "isomorphic-ws";
import EventEmitter from "events";
import { Events } from "./events";
import { Emoticon } from "./emoticon.type";
import moment from "moment";

let defaultUser = {
  id: "",
  uid: "",
  username: "",
  firstname: "",
  lastname: "",
  profileUrl: "",
  color: "",
  custom: {},
};

let defaultNotificationConfig = { type: null, token: null }

export const connectionStates = {
  NO_CONNECTION: {
    connecting: false,
    isConnected: false,
    fetchingConversations: false,
  },
  GETTING_CONVERSATIONS: {
    connecting: true,
    isConnected: false,
    fetchingConversations: true,
  },
  SOCKET_CONNECTING: {
    connecting: true,
    isConnected: false,
    fetchingConversations: false,
  },
  SOCKET_CONNECTED: {
    connecting: false,
    isConnected: true,
    fetchingConversations: false,
  },
} as const;

export type ConnectionState = typeof connectionStates[keyof typeof connectionStates];

export default class Connection extends EventEmitter {
  private static connection: Connection;
  connecting: boolean;
  socket: WebSocket | null;
  conversations: Array<Conversation>;
  conversationMap: ConversationMap;
  // wsConnected: boolean;
  wsAccessConfig: WsAccessConfig;
  // fetchingConversations: boolean;
  retry_delay_ms: number;
  max_retry_count: number;
  health_check_interval: number;
  retry_count: number;
  userMeta: UserMeta;
  projectConfig: Config;
  activeConversationId: string;
  screen: Screens;
  broadcastListMeta: ConversationListMeta;
  conversationListMeta: ConversationListMeta; // lastMessage field should be changed to use the last message in the conversation
  private healthCheckRef: NodeJS.Timeout | undefined;
  private retryRef: NodeJS.Timeout | undefined;
  shouldReconnect: boolean;
  connectionState: ConnectionState;
  notificationConfig: NotificationConfig

  constructor(client_instance: ChatClient) {
    super();
    this.connecting = false;
    this.socket = null;
    this.conversations = [];
    this.conversationMap = {};
    this.conversationListMeta = {};
    this.broadcastListMeta = {};
    this.wsAccessConfig = { url: "", token: "" };
    this.retry_delay_ms = 5000;
    this.max_retry_count = 5;
    this.health_check_interval = 30000;
    this.retry_count = 0;
    this.userMeta = defaultUser;
    (this.projectConfig = {
      projectId: client_instance.projectId,
      subId: client_instance.subId,
    }),
      (this.activeConversationId = "");
    this.screen = Screens.CONVERSATIONS;
    this.healthCheckRef = undefined;
    this.shouldReconnect = true;
    this.connectionState = connectionStates.NO_CONNECTION;
    this.notificationConfig = { type: null, token: null };
  }

  static getInstance(client_instance: ChatClient) {
    if (Connection.connection) {
      return Connection.connection;
    }
    Connection.connection = new Connection(client_instance);
    return Connection.connection;
  }

  updateConnectionState(state: ConnectionState) {
    this.connectionState = state
    this.emit(Events.CONNECTION_CHANGED, state);
  }

  private async _getConversations({ token }: { token: string }) {
    try {
      if (this.userMeta) {
        // this.fetchingConversations = true;
        this.updateConnectionState(connectionStates.GETTING_CONVERSATIONS)
        const response = await GET_CONVERSATIONS<{
          conversations: Conversation[];
        }>(token);
        if (response.success) {
          const conversationListMeta: ConversationListMeta =
            response.data.conversations.reduce((acc, conversation) => {
              var sortedConversation = this.sortConversationMessages([
                conversation,
              ]);
              var messages = sortedConversation[0].messages;
              var lastMessage = messages[messages.length - 1];

              acc[conversation.conversationId] = {
                conversation: sortedConversation[0],
                lastMessage: lastMessage,
                unread: this._getUreadMessageIds(this.userMeta.uid, messages),
              };
              return acc;
            }, {} as ConversationListMeta);
          var conversationMap = response.data.conversations.reduce(
            (acc, conversation) => {
              acc[conversation.conversationId] = conversation;
              return acc;
            },
            {} as ConversationMap
          );
          this.conversationMap = conversationMap;

          this.emit(Events.CONVERSATION_LIST_META_CHANGED, {
            conversationListMeta,
          });
          this.conversationListMeta = conversationListMeta;

          // this.conversations = this.sortConversationMessages(
          //   response.data.conversations
          // );
          this.conversations = response.data.conversations;
        } else {
          console.error("An error occurred while fetching conversations");
        }
      } else {
        throw new Error("User not initialized");
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error(err);
      }
    } finally {
      // this.fetchingConversations = false;
    }
  }

  
  private async _getBroadcastLists({ token }: { token: string }) {
    try {
      if (this.userMeta) {
        // this.fetchingConversations = true;
        const response = await GET_BROADCASTLISTS<{
          conversations: Conversation[];
        }>(token);
        if (response.success) {
          const broadcastListMeta: ConversationListMeta =
            response.data.conversations.reduce((acc, conversation) => {
              var sortedConversation = this.sortConversationMessages([
                conversation,
              ]);
              var messages = sortedConversation[0].messages;
              var lastMessage = messages[messages.length - 1];

              acc[conversation.conversationId] = {
                conversation: sortedConversation[0],
                lastMessage: lastMessage,
                unread: []
              };
              return acc;
            }, {} as ConversationListMeta);
          
          this.emit(Events.BROADCAST_LIST_META_CHANGED, {
            broadcastListMeta,
          });
          this.broadcastListMeta = broadcastListMeta;
        } else {
          console.error("An error occurred while fetching broadcast lists");
        }
      } else {
        throw new Error("User not initialized");
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error(err);
      }
    } finally {
      // this.fetchingConversations = false;
    }
  }


  async _initiateConnection(
    user: UserMeta,
    config?: {
      notificationConfig?: NotificationConfig;
      connectionConfig?: { reset: boolean };
    }
  ) {
    try {
    
      this.shouldReconnect = true;
      this.userMeta = user;
      if (config?.connectionConfig?.reset) {
        this.retry_count = 0;
      }
      // Ensure we have a valid userMeta.uid
      if (!this.userMeta?.uid) return null;

      // Clear previous health check interval
      clearTimeout(this.retryRef);
      clearTimeout(this.retryRef);

      if(config?.notificationConfig){
        this.notificationConfig = config.notificationConfig
      }
      // Create a session to retrieve token and wsURI
      const res = await CREATE_SESSION<{ token: string; wsURI: string }>({
        userId: this.userMeta.uid,
        projectId: this.projectConfig.projectId,
        subId: this.projectConfig.subId,
      });
      // If session creation was successful
      if (res.success) {
        // if(this.retryRef){
        //   clearInterval(this.retryRef)
        // }
        this.wsAccessConfig = {
          url: res.data.wsURI,
          token: res.data.token,
        };
        // Fetch conversations after acquiring the session
        await Promise.all([ await this._getConversations({
          token: res.data.token,
        }), await this._getBroadcastLists({ token: res.data.token })])
       
        this.updateConnectionState(connectionStates.SOCKET_CONNECTING)
        // this.emit(Events.CONNECTION_CHANGED, connectionStates.SOCKET_CONNECTING);

        // Define the message to send on connection
        const message = JSON.stringify({
          from: this.userMeta.uid,
          to: "",
          action: ServerActions.INITIALIZE,
          userMeta: {
            ...this.userMeta,
          },
          newConversation: true,
          recipientMeta: {},
          projectId: this.projectConfig.projectId,
          notification: this.notificationConfig
        });

        // Check if WebSocket is already open
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          this.socket.send(message); // send the message
          // this.wsConnected = true;

          // Emit successful connection state
          this.updateConnectionState(connectionStates.SOCKET_CONNECTED)
          // this.emit(Events.CONNECTION_CHANGED, connectionStates.SOCKET_CONNECTED);
        } else {
          if (this.socket) {
            this.socket.close();
          }
          // If socket is not open, create a new WebSocket connection
          const ws = new WebSocket(`wss://${this.wsAccessConfig.url}`);
          // Handle WebSocket open event
          ws.onopen = () => {
            console.log("socket opened");
            this.socket = ws; // Set the active socket

            // Send the initial message
            ws.send(message);
            // this.wsConnected = true;

            // Setup event handlers and start health checks
            this.setupEventHandlers();
            // this.startHealthCheck();

            // Emit connection success
            this.connecting = false;
            this.updateConnectionState(connectionStates.SOCKET_CONNECTED)
            // this.emit(Events.CONNECTION_CHANGED, connectionStates.SOCKET_CONNECTED);

            // Emit updated conversation list
            this.emit(Events.CONVERSATION_LIST_CHANGED, {
              conversations: this.conversations,
            });
            this.retry_count = 0;
          };
        }
      } else {
        // Handle unsuccessful session creation
        // this.wsConnected = false;
        this.updateConnectionState(connectionStates.NO_CONNECTION)
        // this.emit(Events.CONNECTION_CHANGED, connectionStates.NO_CONNECTION);
      }
    } catch (error) {
      // Handle general errors
      console.error("Connection error:", error);
      // this.wsConnected = false;
      this.updateConnectionState(connectionStates.NO_CONNECTION)
      // this.emit(Events.CONNECTION_CHANGED, connectionStates.NO_CONNECTION);

      // Needs to be handled better
      console.warn("Connection error. Attempting to reconnect...");
      this.retryConnection();
    } finally {
    }
  }

  private sortMesssages(messages: Array<Message>) {
    var sorted = messages.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
    return sorted;
  }

  private sortConversationMessages(data: Conversation[]): Conversation[] {
    return data.map((conversation) => {
      const sortedMessages = [...conversation.messages].sort((a, b) => {
        const dateA = moment(a.createdAt).valueOf();
        const dateB = moment(b.createdAt).valueOf();
        return dateA - dateB;
      });

      return { ...conversation, messages: sortedMessages };
    });
  }

  private _getUreadMessageIds(userId: string, messages: Array<Message>) {
    var ids: string[] = [];
    messages.map((m) => {
      if (m.messageState === MessageStates.SENT && m.from !== userId) {
        ids.push(m.messageId);
      }
    });
    return ids;
  }

  _wsDisconnect(config?: { shouldReconnect: boolean }) {
    try {
      if (this.socket) {
        this.shouldReconnect = config?.shouldReconnect ?? true;
        // this.wsConnected = false;
        const data = JSON.stringify({
          action: ServerActions.CONNECTION_CLOSED,
          message: {
            projectId: this.projectConfig.projectId,
            from: this.userMeta.uid,
            user: this.userMeta
          },
        });
        this.socket.send(data);
        this.socket.close();
        this.conversationMap = {};
        this.conversationListMeta = {};
        this.broadcastListMeta = {}
        this.updateConnectionState(connectionStates.NO_CONNECTION);
        // this.emit(Events.CONNECTION_CHANGED, {
        //   connecting: false,
        //   isConnected: false,
        //   fetchingConversations: false,
        // });
      }
    } catch (error) {
      if(error instanceof Error){
        console.error(error.message)
      }
    }
  }

  private startHealthCheck() {
    if (this.socket) {
      if (this.healthCheckRef) {
        clearInterval(this.healthCheckRef);
      }

      // Set the new interval
      this.healthCheckRef = setInterval(() => {
        // Check WebSocket connection status
        if (this.socket?.readyState === WebSocket.OPEN) {
          const data = JSON.stringify({
            action: ServerActions.HEALTH_CHECK,
            message: {
              message: "Hello!",
              from: this.userMeta.uid,
              token: this.wsAccessConfig.token,
              user: this.userMeta
            },
          });
          this.socket.send(data); // send the health check message
          this.emit(Events.CONVERSATION_LIST_META_CHANGED, {
            conversationListMeta: this.conversationListMeta,
          });
        }
      }, 30000);
    }
  }

  private retryConnection() {
    // Retry logic or call _initiateConnection() after delay
    if (this.retry_count >= this.max_retry_count) {
      return console.warn(
        `Connection attempt failed after multiple retries. Please check your network settings or try again.`
      );
    }
    this.updateConnectionState(connectionStates.SOCKET_CONNECTING)
    // this.emit(Events.CONNECTION_CHANGED, {
    //   connecting: true,
    //   isConnected: false,
    //   fetchingConversations: false,
    // });
    if (!this.connectionState.isConnected) {
      this.retryRef = setTimeout(() => {
        this._initiateConnection(this.userMeta);
        this.retry_count += 1;
      }, 5000);
    }
  }

  private setupEventHandlers() {
    if (this.socket) {
      this.socket.onmessage = (event: MessageEvent) => {
        const msClient = MessageClient.getInstace(this, "");
        msClient.messageEventHandler(event);
      };

      // Handle errors
      this.socket.onerror = (event: ErrorEvent) => {
        // this.wsConnected = false;
        if (this.shouldReconnect) {
          console.error("Socket error. Attempting to reconnect... Event: ", event);
          this.retryConnection();
        }
      };

      // Handle disconnection (socket closes)
      this.socket.onclose = () => {
        // this.wsConnected = false;
        if (this.shouldReconnect) {
          console.warn("Socket closed. Attempting to reconnect...");
          this.retryConnection();
        }
      };

      this.startHealthCheck();
    }
  }
}
