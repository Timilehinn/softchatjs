import Connection from "./Connection";
import Conversation from "./Conversation";
import MessageClient from "./MessageClient";
import { buildError } from "./error";
import { Events } from "./events";
import {
  Config,
  GroupChatMeta,
  UserMeta,
} from "./types";
import WebSocket from "isomorphic-ws";

let defaultUser = {
  id: "",
  uid: "",
  username: "",
  firstname: "",
  lastname: "",
  profileUrl: "",
  color: "",
  custom: {}
}

export type NotificationConfig = {
  expo: {
    expoPushToken: string
  },
  web: {},
  fcm: {
    deviceId: string
  },
  apns: {
    deviceId: string
  }
}

export default class ChatClient {
  private static client_instance: ChatClient;
  private connection: Connection | null;
  subId: string;
  projectId: string;
  userMeta: UserMeta;

  constructor(subId: string, projectId: string) {
    this.subId = subId;
    this.projectId = projectId;
    this.userMeta = defaultUser,
    this.connection = null
  }

  static getInstance({ projectId, subId }: Config) {
    if (!ChatClient.client_instance) {
      ChatClient.client_instance = new ChatClient(subId, projectId);
      return ChatClient.client_instance
    }
    return ChatClient.client_instance
  }

  initializeUser(data: UserMeta, config?: { notificationConfig?: NotificationConfig, connectionConfig?: { reset: boolean } }) {
    if (data) {
      this.userMeta = data;
      if (ChatClient.client_instance) {
        const conn = Connection.getInstance(ChatClient.client_instance);
        this.connection = conn;
        this.connection.emit(Events.CONNECTION_CHANGED, {
          connecting: true,
          isConnected: false,
          fetchingConversations: true,
        });
        conn._initiateConnection(config);
      }
    }
  }

  disconnect() {
    if (this.connection) {
      return this.connection._wsDisconnect();
    } else {
      throw new Error(buildError("USER_NOT_INITIATED", "disconnect"));
    }
  }

  retryConnection() {
    if (this.connection) {
      // return this.connection._retryConnection();
      if (this.connection.socket?.readyState !== WebSocket.OPEN) {
        console.info("Retrying connection...");
        if (this.userMeta) {
          this.connection._initiateConnection();
        }
      }
    } else {
      throw new Error(buildError("USER_NOT_INITIATED", "retryConnection"));
    }
  }

  getConnectionStatus() {
    if (this.connection) {
      return {
        isConnecting: this.connection.connecting,
        isConnected: this.connection.wsConnected,
        isFetchingConversations: this.connection.fetchingConversations,
      };
    } else {
      return {
        isConnecting: false,
        isConnected: false,
        isFetchingConversations: false,
      };
    }
  }

  subscribe(event: string, func: (event: any) => void) {
    if (this.connection) {
      this.connection.on(event, func);
    } else {
      throw new Error(
        "Unable to subscribe for events, create a connection first"
      );
    }
  }

  unsubscribe(event: string, func: (event: any) => void) {
    if (this.connection) {
      this.connection.off(event, func);
    }
  }

  unsubscribeAll(event: string) {
    if (this.connection) {
      this.connection.removeAllListeners(event);
    }
  }

  getConversations() {
    if(this.connection) {
      return this.connection.conversationListMeta
    }else{
      console.warn("No connection available, initialize user before calling method")
      return {}
    }
  }

  newConversation(participantDetails: UserMeta[] | UserMeta, groupMeta: GroupChatMeta | null): Conversation {
    if(this.connection) {
      const conversation = Conversation.getInstance(this.connection, participantDetails, groupMeta);
      return conversation
    }else{
      throw new Error("No connection available")
    }
  }

  messageClient(conversationId: string) {
    if (this.connection) {
      const msClient = MessageClient.getInstace(this.connection, conversationId);
      return {
        getMessages: msClient.getMessages.bind(msClient),
        getConversation: msClient.getConversation.bind(msClient),
        sendMessage: msClient.sendMessage.bind(msClient),
        editMessage: msClient.editMessage.bind(msClient),
        sendTypingNotification: msClient.sendTypingNotification.bind(msClient),
        sendStoppedTypingNotification: msClient.sendStoppedTypingNotification.bind(msClient),
        reactToMessage: msClient.reactToMessage.bind(msClient),
        uploadAttachment: msClient.uploadAttachment.bind(msClient),
        uploadAttachmentV2: msClient.uploadAttachmentV2.bind(msClient),
        uploadFile: msClient.uploadFile.bind(msClient),
        setActiveConversation: msClient.setActiveConversation.bind(msClient),
        unSetActiveConversation: msClient.unSetActiveConversation.bind(msClient),
        getEmojiList: msClient.getEmojiList.bind(msClient),
        deleteMessage: msClient.deleteMessage.bind(msClient),
        readMessages: msClient.readMessages.bind(msClient),
      }
    } else {
      throw new Error("No connection available");
    }
  }
}

