import Connection from "./Connection";
import { Errors } from "./error";
import { Events } from "./events";
import {
  AttachmentTypes,
  BroadcastListMeta,
  Conversation,
  ConversationListItem,
  ConversationType,
  GroupChatMeta,
  Message,
  MessageStates,
  Participant,
  Prettify,
  SendGroupMessageGenerics,
  SendMessageGenerics,
  ServerActions,
  UserMeta,
} from "./types";
import {
  generateConversationId,
  generateFillerTimestamps,
  generateId,
} from "./utils";

let userMetaSample = {
  id: "",
  username: "",
  email: "",
  firstname: "",
  lastname: "",
  profileImgUrl: "",
  phone: "",
  profileBannerUrl: "",
  custom: {},
};
export default class BroadcastList {
  private static conversation: BroadcastList | null = null;
  private connection: Connection;
  private participants: UserMeta[];

  constructor(connection: Connection, participants: UserMeta[]) {
    this.connection = connection;
    this.participants = participants;
  }

  static getInstance(
    connection: Connection,
    participants: UserMeta[]
  ): BroadcastList {
    if (BroadcastList.conversation) {
      return BroadcastList.conversation;
    }
    BroadcastList.conversation = new BroadcastList(connection, participants);
    return BroadcastList.conversation;
  }

  private generateConversation(conversationId: string): Conversation & { name: string } {
    const timeStamps = generateFillerTimestamps();
    const participantIds = this.participants.map((p) => p.uid);
    const senderObject = {
      id: generateId(),
      uid: this.connection.userMeta.uid,
      participantId: this.connection.userMeta.uid,
      participantDetails: {
        ...this.connection.userMeta,
        ...timeStamps,
      },
      ...timeStamps,
    };

    const updatedParticipantList = this.participants.map((participant) => ({
      id: generateId(),
      uid: participant.uid,
      participantId: participant.uid,
      participantDetails: {
        ...participant,
        ...timeStamps,
      },
      ...timeStamps,
    }));

    const participantList = [senderObject, ...updatedParticipantList];

    return {
      name: 'Broadcastlist',
      participants: [this.connection.userMeta.uid, ...participantIds],
      admins: [this.connection.userMeta.uid],
      conversationId,
      messages: [],
      conversationType: "broadcast-chat",
      participantList,
      meta: null,
      groupMeta: null,
      ...timeStamps,
    };
  }

  create() {
    if(!this.connection){
      throw new Error('Inialize uesr before calling method')
    }
      const conversationId = generateId();
      const newConveration = this.generateConversation(conversationId);
      const socketMessage = {
        action: ServerActions.CREATE_BROADCAST_LIST,
        message: {
          conversationId,
          name: "Broadcast list",
          participants: this.participants,
          token: this.connection.wsAccessConfig.token,
        },
      };
      this.connection.socket.send(JSON.stringify(socketMessage));
      this.connection.broadcastListMeta[conversationId] = {
        conversation: newConveration,
        lastMessage: null,
        unread: []
      };
      this.reset();
      this.connection.emit(Events.BROADCAST_LIST_META_CHANGED, {
        broadcastListMeta: this.connection.broadcastListMeta,
      });
      return { [conversationId]: {
        conversation: newConveration,
        lastMessage: null,
        unread: []
      }}
  }

  reset() {
    BroadcastList.conversation = null;
  }
}
