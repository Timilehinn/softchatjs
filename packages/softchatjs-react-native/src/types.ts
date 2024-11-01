// import { DeepOmit } from "deep-utility-types"
import { Dispatch, SetStateAction } from "react"
import { TextInput } from "react-native"
import { Image } from "react-native-svg"

export enum ClientActions {
  INCOMING_MESSAGE = 'incomingMessage',
  MESSAGES_READ = 'messagesRead',
  USER_IS_TYPING = 'userIsTyping',
  MESSAGE_ERROR = 'sendMessageError',
  NEW_MESSAGE_REACTION = 'newMessageReaction',
  ACK_HEALTH_CHECK = 'acknowledgeHealthCheck',
  EDITED_MESSAGE = 'editedMessage'
}

// sent to the server
export enum ServerActions {
  INITIALIZE = 'initialize',
  SEND_MESSAGE = 'sendMessage',
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

// type User = UserMeta & Timetamps & {
//   color?: string,
//   expoPushToken?: string,
//   id?: string,
//   username?: string
// }
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
  color?: string,
  custom?: Record<string, string>,
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
  }
}

export type Point = {
  lng: number,
  lat: number
}

type QuotedMessage = Message | null

type ImageUploadState = {
  isUploading: true,
  base64: string
}

export type Message = {
  conversationId: string,
  from: string,
  to: string,
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
  attachedMedia: Media[]
  token?: string,
  quotedMessageId: string,
  quotedMessage: QuotedMessage | null,
  reactions: Reaction[],
  lastEdited: Date | string | null,
  isUploading?: boolean
}
& 
Timetamps
// // when an image is being uploaded, message comes with the meta below:
// & ImageUploadState

export type ParticipantListInfo = {
  id: string;
  uid: string,
  projectId: string | null;
  connectionId: string;
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

export type SetState<T> = Dispatch<SetStateAction<T>>

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

export type Children = React.ReactNode;

// external

export type ChatBubbleRenderProps = {
  message: Omit<Message, 'conversationId' | 'token' | 'shouldEdit'>
}

export type ChatInputRenderProps = {
  sendMessage: (externalInputRef: React.RefObject<TextInput>) => void;
  value: string,
  onValueChange: (value: string) => void;
  openMediaOptions: (externalInputRef: React.RefObject<TextInput>) => void;
  openEmojis: () => void;
  onStopEditing: () => void;
  isEditing: boolean,
  onStartRecording: () => void;
  onDeleteRecording: () => void;
  sendVoiceMessage: () => void;
  // Metering progress where key is the timestamp, metering represents loudness and height is metering height in percentage
  meteringProgress: {[key: number]: { metering: number; height: number }};
  isRecording: boolean,
  // Audio duration in seconds
  audioDuration: number,
  // Is true when connection state changes or loading new messages
  isLoading: boolean
}

export type ConversationHeaderRenderProps = {
  isConnected: boolean,  
  isConnecting: boolean
}

export type ChatHeaderRenderProps = {
  conversationTitle: string | null | undefined, 
  conversationType: string,
  activeUser: UserMeta | undefined,
  groupMeta: GroupChatMeta | null
}

export type ConversationListRenderProps = {
  title: string | undefined,
  recipient: Participant | undefined,
  lastMessage: Message | undefined | null
}

type DefaultColors = {
  primary: string,
  secondary: string
}

export type ChatTheme = {
  background: DefaultColors & { disabled: string },
  text: DefaultColors & { disabled: string },
  action: DefaultColors,
  icon: string,
  divider: string,
  chatBubble: {
    left: {
      bgColor: string,
      messageColor: string,
      messageTimeColor: string,
      replyBorderColor: string
    },
    right: {
      bgColor: string,
      messageColor: string,
      messageTimeColor: string,
      replyBorderColor: string
    }
  }
}

export type Emoji = {
  emoji: string,
  description: string,
  category: string,
  aliases: string[],
  tags: string[],
  unicode_version: string,
  ios_version: string
}