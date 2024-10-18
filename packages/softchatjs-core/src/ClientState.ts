import Connection from "./Connection";
import {
  ClientActions,
  Conversation,
  ConversationType,
  ConversationWithTypingIndicator,
  EditedMessage,
  Message,
  MessageStates,
  Prettify,
  Reaction,
  ReadMessages,
  Screens,
  SendMessageGenerics,
  ServerActions,
  UserMeta,
  WsPayLoad,
} from "./types";
import {
  generateConversationId,
  generateFillerTimestamps,
  generateId,
} from "./utils";
import { Events } from "./events";
import { GET_EMOJIS, GET_MESSAGES, UPLOAD_MEDIA } from "./fetch";
import { Emoticon } from "./emoticon.type";

let CLEAR_UNREAD_TIMEOUT = 1000;

export default class ClientState {
  private static client_state: ClientState;
  public activeConversationId: string;
  public screen: Screens

  constructor() {
    this.activeConversationId = "";
    this.screen = Screens.CONVERSATIONS
  }

  static getInstace() {
    if (ClientState.client_state) {
      return ClientState.client_state;
    } else {
      ClientState.client_state = new ClientState();
      return ClientState.client_state;
    }
  }

  setActiveConversation(conversationId: string) {
    this.activeConversationId = conversationId;
    this.screen = Screens.CHAT
  }

  unSetActiveConversation() {
    this.activeConversationId = "";
    this.screen = Screens.CONVERSATIONS
  }

}
