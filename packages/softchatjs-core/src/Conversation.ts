import Connection from "./Connection";
import { Errors } from "./error";
import { Events } from "./events";
import { AttachmentTypes, ConversationType, GroupChatMeta, Message, MessageStates, Prettify, SendGroupMessageGenerics, SendMessageGenerics, ServerActions, UserMeta } from "./types";
import { generateConversationId, generateFillerTimestamps, generateId } from "./utils";

let userMetaSample = {
  id: '',
  usename: '',
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
  private groupMeta?: GroupChatMeta

  constructor(connection: Connection, participantDetails: UserMeta[] | UserMeta, groupMeta?: GroupChatMeta) {
    this.participants = [];
    this.otherParticipant = null;
    this.conversationType = 'private-chat';
    this.connection = connection;
    this.groupMeta 

    if (Array.isArray(participantDetails)) {
      this.conversationType = 'group-chat';

      var _participants = [];

      for(let p of participantDetails){
        _participants.push({
          ...userMetaSample, ...p
        })
      }
      this.participants = _participants;
      this.groupMeta = groupMeta
    } else {
      this.otherParticipant =  { ...userMetaSample, ...participantDetails };
      this.conversationType = 'private-chat';
    }
  }

  static getInstance(connection: Connection, participantDetails: UserMeta[] | UserMeta, groupMeta?: GroupChatMeta): Conversation {
    if (Conversation.conversation) {
      return Conversation.conversation;
    } else {
      Conversation.conversation = new Conversation(
        connection,
        participantDetails,
        groupMeta
      );
      return Conversation.conversation;
    }
  }

  private generateConversation(conversationId: string,  participants: UserMeta[], message: Message, conversationType: ConversationType ) {
    const timeStamps = generateFillerTimestamps()
    const participantIds = participants.map(p => p.uid)
    const senderObject = {
      id: generateId(),
      uid: this.connection.userMeta.uid,
      participantId: this.connection.userMeta.uid,
      participantDetails: {
          // uid: this.connection.userMeta.uid,
          // meta: this.connection.userMeta,
          ...this.connection.userMeta,
          ...timeStamps
      },
      ...timeStamps
    }

    var updatedParticipantList = [];
      var i = 0;
      var len = participants.length;

      while(i < len){
        updatedParticipantList.push({
          id: generateId(),
          uid: participants[i].uid,
          participantId: participants[i].uid,
          participantDetails: {
              // uid: participants[i].uid,
              ...participants[i],
              // meta: participants[i],
              ...timeStamps
          },
          ...timeStamps
        })
        i++
      }

    if(conversationType === 'private-chat') {
      return {
        participants: participantIds,
        admins: [this.connection.userMeta.uid],
        conversationId: conversationId,
        messages: [ message ],
        conversationType,
        participantList: [senderObject, ...updatedParticipantList],
        meta: null,
        groupMeta: null,
        ...timeStamps
      }
    } else if(conversationType === 'group-chat'){
      return {
        participants: participantIds,
        admins: [this.connection.userMeta.uid],
        conversationId: conversationId,
        messages: [ message ],
        conversationType,
        participantList: [ ...updatedParticipantList, senderObject ],
        meta: null,
        groupMeta: null,
        ...timeStamps
      }
    } else {
      throw new Error('Error generating conversation struct: Client Error')
    }
  }

  create(text: string) {
    const messageId = generateId();
    var groupConversationId = generateId();
    
    var fullMessage = {
      messageId: messageId,
      from: this.connection.userMeta.uid,
      to: [{}],
      conversationType: this.conversationType,
      groupMeta: this.groupMeta || {
        groupName: 'My group',
        groupIcon: 'https://picsum.photos/200/300',
        groupBanner: 'https://picsum.photos/200/300'
      },
      senderMeta: this.connection.userMeta,
      participantIds: [],
      message: { 
        message: text,
        messageId: messageId,
        messageState: MessageStates.SENT, 
        conversationId: '',
        from: this.connection.userMeta.uid,
        to: '',
        attachmentType: AttachmentTypes.NONE,
        messageOwner: {
          ...this.connection.userMeta,
          meta: this.connection.userMeta,
          ...generateFillerTimestamps()
        },
        attachedMedia: [],
        quotedMessageId: '',
        quotedMessage: null,
        reactions: [],
        lastEdited: null,
        ...generateFillerTimestamps()
      },
      token: this.connection.wsAccessConfig.token,
    }

    if(this.conversationType === 'group-chat'){
      if(this.participants.length === 0) {
        throw new Error(Errors.CONVERSATION_NOT_PREPARED)
      }
      var participantIds = this.participants.map(p => p.uid)

      fullMessage.message.conversationId = groupConversationId;
      fullMessage.to = this.participants;
      fullMessage.message.messageState = MessageStates.SENT;
      fullMessage.message.to = groupConversationId;
      fullMessage.participantIds = [ ...participantIds, this.connection.userMeta.uid ] as any

      const socketMessage = {
        action: ServerActions.CREATE_CONVERSATION,
        message: fullMessage
      };
      
      if (this.connection.socket) {

        this.connection.socket.send(JSON.stringify(socketMessage));
        
        const conversation = this.generateConversation(
          groupConversationId,
          this.participants,
          fullMessage.message,
          'group-chat'
        )
        this.connection.conversationListMeta[groupConversationId] = {
          conversation: conversation,
          lastMessage: fullMessage.message,
          unread: [],
        };
        this.connection.emit(Events.CONVERSATION_LIST_META_CHANGED, {
          conversationListMeta: this.connection.conversationListMeta,
        });
      }
      
    }else{

      // PRIVATE CONVERSATION
      if(!this.otherParticipant) {
        throw new Error(Errors.CONVERSATION_NOT_PREPARED)
      }
      var privateConversationId = generateConversationId(this.connection.userMeta.uid, this.otherParticipant?.uid);
      console.log(this.otherParticipant?.uid, '--this.otherParticipant?.uid')
      console.log(privateConversationId, '---new prv id')

      fullMessage.message.conversationId = privateConversationId;
      fullMessage.to = [this.otherParticipant];
      fullMessage.message.messageState = MessageStates.SENT;
      fullMessage.message.to = this.otherParticipant.uid;
      fullMessage.participantIds = [ this.otherParticipant.uid, this.connection.userMeta.uid ] as any
      const socketMessage = {
        action: ServerActions.CREATE_CONVERSATION,
        message: fullMessage
      };
      
      if (this.connection.socket) {
        
        this.connection.socket.send(JSON.stringify(socketMessage));
       
        const conversation = this.generateConversation(
          privateConversationId,
          [this.otherParticipant],
          fullMessage.message,
          'private-chat'
        )
        if(!this.connection.conversationListMeta[privateConversationId]) {
          this.connection.conversationListMeta[privateConversationId] = {
            conversation: conversation,
            lastMessage: fullMessage.message,
            unread: [],
          };
          this.connection.emit(Events.CONVERSATION_LIST_META_CHANGED, {
            conversationListMeta: this.connection.conversationListMeta,
          });
        }else{

          /**
           * if converstaion already exists for user
           * - Push the new message into the conversation.message list and remove the first items to keep the message length at 25
           * - Update the lastMessage
           */
          var prevConversation = this.connection.conversationListMeta[privateConversationId];
          var conversations = prevConversation.conversation;
          var updatedMessageList = conversations.messages
          updatedMessageList.unshift();
          updatedMessageList.push(fullMessage.message)
          this.connection.conversationListMeta[privateConversationId] = {
            conversation: { ...conversations, messages: updatedMessageList },
            lastMessage: fullMessage.message,
            unread: [],
          };
          this.connection.emit(Events.CONVERSATION_LIST_META_CHANGED, {
            conversationListMeta: this.connection.conversationListMeta,
          });
        }
      }
    }
  }

  reset() {
    Conversation.conversation = null
  }
}