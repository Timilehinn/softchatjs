import Connection from "./Connection";
import { Errors } from "./error";
import { Events } from "./events";
import { AttachmentTypes, ConversationType, GroupChatMeta, Message, MessageStates, Participant, Prettify, SendGroupMessageGenerics, SendMessageGenerics, ServerActions, UserMeta } from "./types";
import { generateConversationId, generateFillerTimestamps, generateId } from "./utils";

let userMetaSample = {
  id: '',
  username: '',
  email: '',
  firstname: '',
  lastname: '',
  profileImgUrl: '',
  phone: '',
  profileBannerUrl: '',
  custom: {},
}
export default class Conversation {
  private static conversation: Conversation | null = null;
  private connection: Connection;
  private participants: UserMeta[];
  private otherParticipant: UserMeta | null;
  private conversationType: 'group-chat' | 'private-chat';
  private groupMeta: GroupChatMeta | null;

  constructor(
    connection: Connection,
    participantDetails: UserMeta[] | UserMeta,
    groupMeta: GroupChatMeta | null
  ) {
    this.connection = connection;
    this.participants = [];
    this.otherParticipant = null;
    this.conversationType = 'private-chat';

    if (Array.isArray(participantDetails)) {
      this.conversationType = 'group-chat';
      this.participants = participantDetails.map((p) => ({
        ...userMetaSample,
        ...p,
      }));
      this.groupMeta = groupMeta;
    } else {
      console.log(participantDetails, '::incoming details')
      this.otherParticipant = { ...userMetaSample, ...participantDetails };
      this.conversationType = 'private-chat';
      this.groupMeta = null
    }
  }

  static getInstance(
    connection: Connection,
    participantDetails: UserMeta[] | UserMeta,
    groupMeta: GroupChatMeta | null
  ): Conversation {
    if (Conversation.conversation) {
      return Conversation.conversation;
    }
    Conversation.conversation = new Conversation(
      connection,
      participantDetails,
      groupMeta
    );
    return Conversation.conversation;
  }

  private generateConversation(
    conversationId: string,
    participants: UserMeta[],
    message: Message,
    conversationType: 'group-chat' | 'private-chat'
  ) {
    const timeStamps = generateFillerTimestamps();
    const participantIds = participants.map((p) => p.uid);
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

    const updatedParticipantList = participants.map((participant) => ({
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
      participants: [this.connection.userMeta.uid, ...participantIds],
      admins: [this.connection.userMeta.uid],
      conversationId,
      messages: [message],
      conversationType,
      participantList,
      meta: null,
      groupMeta: conversationType === 'group-chat' ? this.groupMeta : null,
      ...timeStamps,
    };
  }

  create(text?: string) {
    const messageId = generateId();
    const groupConversationId = generateId();

    const fullMessage = {
      messageId,
      from: this.connection.userMeta.uid,
      to: [{}],
      conversationType: this.conversationType,
      groupMeta: this.groupMeta || {
        groupName: 'My group',
        groupIcon: 'https://picsum.photos/200/300',
        groupBanner: 'https://picsum.photos/200/300',
      },
      senderMeta: this.connection.userMeta,
      participantIds: [] as string[],
      message: {
        message: text,
        messageId,
        messageState: MessageStates.SENT,
        conversationId: '',
        from: this.connection.userMeta.uid,
        to: '',
        attachmentType: AttachmentTypes.NONE,
        messageOwner: {
          ...this.connection.userMeta,
          meta: this.connection.userMeta,
          ...generateFillerTimestamps(),
        },
        attachedMedia: [],
        quotedMessageId: '',
        quotedMessage: null,
        reactions: [],
        lastEdited: null,
        ...generateFillerTimestamps(),
      },
      token: this.connection.wsAccessConfig.token,
    };

    if (this.conversationType === 'group-chat') {
      if (this.participants.length === 0) {
        throw new Error(Errors.CONVERSATION_NOT_PREPARED);
      }

      const participantIds = this.participants.map((p) => p.uid);
      fullMessage.message.conversationId = groupConversationId;
      fullMessage.to = this.participants;
      fullMessage.participantIds = [
        ...participantIds,
        this.connection.userMeta.uid,
      ];

      this.sendMessage(fullMessage, groupConversationId, this.participants, 'group-chat');
    } else {
      if (!this.otherParticipant) {
        throw new Error(Errors.CONVERSATION_NOT_PREPARED);
      }

      const privateConversationId = generateConversationId(
        this.connection.userMeta.uid,
        this.otherParticipant.uid,
        this.connection.projectConfig.projectId
      );

      console.log([this.connection.userMeta.uid,
        this.otherParticipant.uid], "---ids")

      console.log(privateConversationId, '--private conversation di')

      fullMessage.message.conversationId = privateConversationId;
      fullMessage.message.to = this.otherParticipant.uid;
      fullMessage.to = [this.otherParticipant];
      fullMessage.participantIds = [
        this.otherParticipant.uid,
        this.connection.userMeta.uid,
      ];

      this.sendMessage(fullMessage, privateConversationId, [this.otherParticipant], 'private-chat');
    }
  }

  private sendMessage(fullMessage: any, conversationId: string, participants: UserMeta[], type: 'group-chat' | 'private-chat') {
    const socketMessage = {
      action: ServerActions.CREATE_CONVERSATION,
      message: fullMessage,
    };

    if (this.connection.socket) {
      this.connection.socket.send(JSON.stringify(socketMessage));

      const conversation = this.generateConversation(
        conversationId,
        participants,
        fullMessage.message,
        type
      );

      console.log(conversation)

      if (!this.connection.conversationListMeta[conversationId]) {
        this.connection.conversationListMeta[conversationId] = {
          conversation,
          lastMessage: fullMessage.message,
          unread: [],
        };
      } else {
        const prevConversation = this.connection.conversationListMeta[conversationId];
        prevConversation.conversation.messages.unshift(fullMessage.message);
      }

      this.connection.emit(Events.CONVERSATION_LIST_META_CHANGED, {
        conversationListMeta: this.connection.conversationListMeta,
      });
      this.reset();
    }
  }

  reset() {
    Conversation.conversation = null;
  }
}
