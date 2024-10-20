export enum ClientActions {
  INCOMING_MESSAGE = 'incomingMessage',
  MESSAGES_READ = 'messagesRead',
  USER_IS_TYPING = 'userIsTyping',
  MESSAGE_ERROR = 'sendMessageError',
  NEW_MESSAGE_REACTION = 'newMessageReaction',
  ACK_HEALTH_CHECK = 'acknowledgeHealthCheck',
  EDITED_MESSAGE = 'editedMessage',
  MESSAGE_DELETED = 'deletedMessage',
}

// sent to the server
export enum ServerActions {
  INITIALIZE = 'initialize',
  SEND_MESSAGE = 'sendMessage',
  CREATE_CONVERSATION = 'createConversation',
  SEND_MESSAGE_REPLY = 'sendMessageReply',
  USER_TYPING = 'userTyping',
  HEALTH_CHECK = 'healthCheck',
  SEND_LOCATION = 'sendLocation',
  READ_MESSAGES = 'readMessages',
  DELETE_MESSAGE = 'deleteMessage',
  EDIT_MESSAGE = 'editMessage',
  SEND_MESSAGE_REACTION = 'sendMessageReaction',
  CONNECTION_CLOSED = 'clearUserSession',
}

type Timetamps = {
  createdAt: string | Date
  updatedAt: string | Date
  deletedAt?: string | Date
}

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export enum AttachmentTypes {
  NONE = 'none',
  MAP = 'map',
  MEDIA = 'media',
  STICKER = 'sticker'
}

export interface Participant extends User {
  meta: UserMeta
}

type User = {
  uid: string,
  connectionId?: string,
  projectId?: string,
  meta: UserMeta
} & Timetamps

export type UserMeta = {
  username: string,
  uid: string,
  firstname?: string,
  lastname?: string,
  profileUrl?: string,
  custom?: Record<string, string>,
  color?: string
}

export enum MediaType {
  VIDEO = 'video',
  AUDIO = 'audio',
  IMAGE = 'image',
  DOCUMENT = 'document',
  STICKER = 'sticker'
}

export type Media = {
  type: MediaType,
  ext: string,
  mediaId: string,
  mediaUrl: string,
  mimeType?: string,
  meta?: {
    aspectRatio?: number,
    height?: number,
    width?: number,
    size?: number,
    audioDurationSec?: number,
  },
  uploading?: boolean
}

export type Point = {
  lng: number,
  lat: number
}

type QuotedMessage = Message | null

export type Message = {
  conversationId: string,
  from: string,
  to: string,
  quotedMessage: QuotedMessage | null,
  message: string,
  messageState: number,
  messageId: string,
  attachmentType?: AttachmentTypes,
  messageOwner: UserMeta,
  replyTo?: string,
  sharedLocation?: Point,
  sharedImage?: {
    url: string,
    aspectRatio?: number,
  },
  attachedMedia: Media[],
  token?: string,
  quotedMessageId?: string,
  reactions: Reaction[],
  lastEdited: Date | string | null,
} & Timetamps

export type ParticipantListInfo = {
  id: string;
  uid: string,
  projectId?: string | null;
  connectionId?: string;
  participantId: string,
  participantDetails: UserMeta
} & Timetamps

export type ConversationType = 'private-chat' | 'group-chat'

export type GroupChatMeta = {
  groupName: string,
  groupIcon?: string,
  groupWallpaper?: string,
  groupBanner?: string
}

export type PrivateChatMeta = {
  chatWallpaper?: string,
}

export type Conversation = {
  participants: string[],
  admins: string[],
  conversationId: string,
  messages: Message[],
  conversationType: ConversationType,
  participantList: ParticipantListInfo[],
  meta: PrivateChatMeta | null,
  groupMeta: GroupChatMeta | null
} & Timetamps

export type UploadContent = {
  base64: string,
  conversationId: string,
  key: string
}
//  & Omit<Media, 'mediaUrl'>

export type IncomingMessage = {
  action: ClientActions.INCOMING_MESSAGE,
  message: Message
}

export type WsPayLoad<Action, Data> = {
  action: Action,
  message: Data
}

export type ReceivedAction = ServerActions

export type ReadMessages = {
  uid: string
  messageIds: string[],
}

export type UserTyping = {
  uid: string
}

export type InitiateConnection = {
  from: string,
  to: string,
  newConversation: boolean,
  userDetails: UserMeta,
  recipientMeta: UserMeta,
}

export type StringOrNumber = string | number


export type Config = {
  projectId: string,
  apiKey: string,
}

export type StartConversation = {
  from: string,
  recipientMeta: UserMeta
  message: string
}

export type Reaction = {
  emoji: string,
  uid: string
}

export enum MessageStates {
  NONE = 0,
  FAILED = 1,
  LOADING = 2,
  SENT = 3,
  DELIVERED = 4,
  READ = 5,
}

export type WsAccessConfig = {
  url: string,
  token: string
}

export enum Screens {
  CHAT = "chat",
  CONVERSATIONS = "conversations",
}

export type EditedMessage = { from: string, to: string, conversationId: string, messageId: string, textMessage: string, shouldEdit: boolean }

export type DeletedMessage = {
  conversationId: string, 
  messageId: string, 
}

export type ConversationWithTypingIndicator = {
  conversationId: string;
  timer: NodeJS.Timeout;
  timeActive: Date | string;
};

export type MessageReactionPayload = {
  action: ServerActions,
  message: {
    conversationId: string,
    messageId: string,
    from: string,
    to: string,
    reactions: Array<Reaction>,
  },
}

export type ConversationMap = {
  [key: string]: Conversation
}

export type ConversationListMeta = {
  [key: string]: {
    conversation: Conversation,
    lastMessage: Message | null,
    unread: string[]
  }
}

export type ChatEventGenerics<T> = T

export type ConnectionEvent = {
  connecting: boolean, 
  fetchingConversations: boolean, 
  isConnected: boolean
}

export type SendMessageGenerics<M> = Omit<M, 
'from' | 
'messageState' |
'messageId' |
'messageOwner' |
'token' |
'lastEdit' |
'lastEdited' |
'deletedAt' |
'createdAt' |
'updatedAt' |
'quotedMessageId'
>

export type SendGroupMessageGenerics<M> = Omit<M, 
'to' |
'from' | 
'messageState' |
'messageId' |
'messageOwner' |
'token' |
'lastEdit' |
'lastEdited' |
'deletedAt' |
'createdAt' |
'updatedAt' |
'replyTo' |
'quotedMessageId' |
'quotedMessage' |
'conversationId' |
'attachedMedia'
>