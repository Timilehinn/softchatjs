import Connection from "./Connection";
import {
  ClientActions,
  Conversation,
  ConversationType,
  ConversationWithTypingIndicator,
  DeletedMessage,
  EditedMessage,
  MediaType,
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
import {
  GET_EMOJIS,
  GET_MESSAGES,
  GET_PRESIGNED_URL,
  UPLOAD_ATTACHMENT,
  UPLOAD_MEDIA,
} from "./fetch";
import { Emoticon } from "./emoticon.type";
import moment from "moment";
import { Readable } from "stream";

let CLEAR_UNREAD_TIMEOUT = 1000;

export default class MessageClient {
  private static message_client: MessageClient;
  private connection: Connection;
  // private currentConversationId: string;
  private screen: Screens;
  private idleTimers: { [key: string]: NodeJS.Timeout | undefined };

  constructor(connection: Connection, conversationId: string) {
    this.connection = connection;
    this.idleTimers = {};
    // this.connection.activeConversationId = conversationId;
    this.screen = Screens.CONVERSATIONS;
  }

  static getInstace(connection: Connection, conversationId: string) {
    if (MessageClient.message_client) {
      if (conversationId) {
        MessageClient.message_client.connection.activeConversationId =
          conversationId;
      }
      return MessageClient.message_client;
    } else {
      MessageClient.message_client = new MessageClient(
        connection,
        conversationId
      );
      return MessageClient.message_client;
    }
  }

  private getPublicMethods() {
    return {
      getMessages: this.getMessages.bind(this),
      sendMessage: this.sendMessage.bind(this),
      editMessage: this.editMessage.bind(this),
      sendTypingNotification: this.sendTypingNotification.bind(this),
      reactToMessage: this.reactToMessage.bind(this),
      uploadAttachment: this.uploadAttachment.bind(this),
    };
  }

  private getConversationType(conversationId?: string) {
    // const conversationMeta = this.connection.conversationListMeta[conversationId? conversationId : this.connection.activeConversationId];
    const conversationMeta =
      this.connection.conversationListMeta[
        conversationId ? conversationId : this.connection.activeConversationId
      ];
    return conversationMeta.conversation.conversationType;
  }

  // removes the last item in the list and adds a new one to the end keeping the original length
  private rotateAndInsertMessageList = (
    messageList: Array<Message>,
    message: Message
  ) => {
    var list = [...messageList];
    if (messageList.length >= 25) {
      var list = [...messageList];
      list.unshift();
      list.push(message);
      return list;
    }
    list.push(message);
    return list;
  };

  private _createMessage(newMessage: Message) {
    try {
      if (newMessage) {
        const socketMessage = {
          action: ServerActions.SEND_MESSAGE,
          message: {
            messageId: newMessage.messageId,
            from: newMessage.from,
            to: newMessage.to,
            conversationType: this.getConversationType(),
            message: { ...newMessage, messageState: MessageStates.SENT },
            token: this.connection.wsAccessConfig.token,
          },
        };
        this.connection.emit(Events.NEW_MESSAGE, {
          message: {
            ...newMessage,
            reactions: [],
            messageState: MessageStates.LOADING,
          },
        });
        if (
          this.connection.socket &&
          this.connection.socket?.readyState === WebSocket.OPEN
        ) {
          console.log("has socket");
          this.connection.socket.send(JSON.stringify(socketMessage));
          this.connection.emit(Events.EDITED_MESSAGE, {
            message: {
              ...newMessage,
              reactions: [],
              messageState: MessageStates.SENT,
            },
          });

          var conversationMeta =
            this.connection.conversationListMeta[newMessage.conversationId];
          var updatedMessages = this.rotateAndInsertMessageList(
            conversationMeta.conversation.messages,
            {
              ...newMessage,
              reactions: [],
              messageState: MessageStates.SENT,
            }
          );
          const unread = conversationMeta.unread;
          this.connection.conversationListMeta[newMessage.conversationId] = {
            conversation: {
              ...conversationMeta.conversation,
              messages: updatedMessages,
            },
            lastMessage: {
              ...newMessage,
            },
            unread: unread,
          };
          this.connection.emit(Events.CONVERSATION_LIST_META_CHANGED, {
            conversationListMeta: this.connection.conversationListMeta,
          });
        } else {
          this.connection.emit(Events.EDITED_MESSAGE, {
            message: {
              ...newMessage,
              reactions: [],
              messageState: MessageStates.FAILED,
            },
          });
          // const unread = [
          //   ...this.connection.conversationListMeta[newMessage.conversationId].unread,
          //   newMessage.messageId,
          // ];
          this.connection.conversationListMeta[newMessage.conversationId] = {
            conversation:
              this.connection.conversationListMeta[newMessage.conversationId]
                .conversation,
            lastMessage: {
              ...newMessage,
              messageState: MessageStates.FAILED,
            },
            unread: [],
          };
          this.connection.emit(Events.CONVERSATION_LIST_META_CHANGED, {
            conversationListMeta: this.connection.conversationListMeta,
          });
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        this.connection.emit(Events.NEW_MESSAGE, {
          message: {
            ...newMessage,
            reactions: [],
            messageState: MessageStates.FAILED,
          },
        });
      }
    }
  }

  private _editMessage(message: EditedMessage) {
    try {
      if (message) {
        let updatedMessage = {
          ...message,
          message: message.textMessage,
          lastEdited: new Date(),
        };
        this.connection.emit(Events.EDITED_MESSAGE, {
          message: updatedMessage,
        });
        if (this.connection.socket) {
          const socketMessage = {
            action: ServerActions.EDIT_MESSAGE,
            message: {
              ...updatedMessage,
              token: this.connection.wsAccessConfig.token,
            },
          };
          console.log(message);
          this.connection.socket.send(JSON.stringify(socketMessage));
          var conversationMeta =
            this.connection.conversationListMeta[message.conversationId];
          var prevMessage = conversationMeta.conversation.messages.find(
            (m) => m.messageId === message.messageId
          );
          if (prevMessage) {
            var editedMessage = {
              ...prevMessage,
              message: message.textMessage,
              lastEdited: new Date(),
            };
            var updatedMessageList = conversationMeta.conversation.messages.map(
              (m) => {
                if (m.messageId === message.messageId) {
                  return editedMessage;
                }
                return m;
              }
            );
            this.connection.conversationListMeta[message.conversationId] = {
              conversation: {
                ...conversationMeta.conversation,
                messages: updatedMessageList,
              },
              lastMessage: { ...editedMessage },
              unread: conversationMeta.unread,
            };
            this.connection.emit(Events.CONVERSATION_LIST_META_CHANGED, {
              conversationListMeta: this.connection.conversationListMeta,
            });
          }
        }
      }
    } catch (error) {
      // maybe an error listener instead
      console.error(error);
    }
  }

  _updateMessageReactions(
    conversationId: string,
    messageId: string,
    reactions: Reaction[],
    config?: { ws: boolean; to: string }
  ) {
    this.connection.emit(Events.EDITED_MESSAGE, {
      message: { messageId, reactions },
    });
    // should also send to the lastMessage in conversations meta.
    if (config?.ws) {
      const reactionPayload = {
        action: ServerActions.SEND_MESSAGE_REACTION,
        message: {
          conversationId,
          messageId: messageId,
          from: this.connection.userMeta.uid,
          to: config.to,
          reactions,
          token: this.connection.wsAccessConfig.token,
        },
      };
      this.connection.socket.send(JSON.stringify(reactionPayload));
    }

    var conversationMeta = this.connection.conversationListMeta[conversationId];
    var prevLastMessage = conversationMeta?.lastMessage;

    if (prevLastMessage && prevLastMessage.messageId === messageId) {
      var updatedMessage = {
        ...prevLastMessage,
        reactions,
      };
      var updatedMessages = this.rotateAndInsertMessageList(
        conversationMeta.conversation.messages,
        updatedMessage
      );

      var updatedConversationListMeta = {
        conversation: {
          ...conversationMeta.conversation,
          messages: updatedMessages,
        },
        unread: conversationMeta.unread,
        lastMessage: {
          ...updatedMessage,
        },
      };
      this.connection.conversationListMeta[conversationId] =
        updatedConversationListMeta;
      this.connection.emit(Events.CONVERSATION_LIST_META_CHANGED, {
        conversationListMeta: this.connection.conversationListMeta,
      });
    }
  }

  private storeEditedMessage(data: EditedMessage) {
    const conversation = this.connection.conversationMap[data.conversationId];
    // const conversation = this.connection.conversationMap[data.conversationId];
    if (conversation) {
      var message = conversation.messages.find(
        (message) => message.messageId === data.messageId
      );
      if (message) {
        const updatedMessage = {
          ...message,
          message: data.textMessage,
          lastEdited: new Date(),
        };
        this.connection.emit(Events.EDITED_MESSAGE, {
          message: updatedMessage,
        });
      }
    }
  }

  /**
   *
   * @param conversationId
   * @summary Updates the list of conversations with typing indicator flags
   */
  private showTypingIndicator = (
    conversationId: string,
    action: "START" | "STOP"
  ) => {
    if (action === "START") {
      this.connection.emit(Events.HAS_STARTED_TYPING, {
        conversationId,
      });
    } else {
      this._clearActiveTypingIndicator(conversationId);
      this.idleTimers[conversationId] = setTimeout(() => {
        console.log("Stopped typing event fired");
        this.connection.emit(Events.HAS_STOPPED_TYPING, {
          conversationId,
        });
      }, 4000);
    }
  };
  // sent to message recipient
  private _sendTypingNotification(uid: string) {
    console.log(this.connection.activeConversationId);
    console.log(uid, "--the uid");
    if (this.connection.socket) {
      this.connection.socket.send(
        JSON.stringify({
          action: ServerActions.USER_TYPING,
          message: {
            uid,
            conversationId: this.connection.activeConversationId,
            action: "START",
            conversationType: this.getConversationType(
              this.connection.activeConversationId
            ),
            token: this.connection.wsAccessConfig.token,
          },
        })
      );
    }
  }

  private _sendStoppedTypingNotification(uid: string) {
    if (this.connection.socket) {
      this.connection.socket.send(
        JSON.stringify({
          action: ServerActions.USER_TYPING,
          message: {
            uid,
            conversationId: this.connection.activeConversationId,
            action: "STOP",
            conversationType: this.getConversationType(
              this.connection.activeConversationId
            ),
            token: this.connection.wsAccessConfig.token,
          },
        })
      );
    }
  }

  private addMessageToConversation(newMessage: Message, screen: string) {
    try {
      console.log(newMessage, ":::new mesage");
      const conversation =
        this.connection.conversationMap[newMessage.conversationId];
      if (conversation) {
        const updatedMessages = [
          ...conversation.messages,
          {
            ...newMessage,
            messageState:
              screen === Screens.CHAT ? MessageStates.READ : MessageStates.SENT,
          },
        ];

        this.connection.conversationMap[newMessage.conversationId] = {
          ...conversation,
          messages: updatedMessages,
        };
        this.connection.emit(Events.NEW_MESSAGE, {
          message: {
            ...newMessage,
            messageState:
              screen === Screens.CHAT ? MessageStates.READ : MessageStates.SENT,
          },
        });

        const unread = [
          ...this.connection.conversationListMeta[newMessage.conversationId]
            .unread,
        ];

        if (
          newMessage.conversationId !== this.connection.activeConversationId
        ) {
          unread.push(newMessage.messageId);
        }

        const updatedConversationListMeta = {
          conversation: {
            ...this.connection.conversationListMeta[newMessage.conversationId]
              .conversation,
            messages: updatedMessages,
          },
          lastMessage: {
            ...newMessage,
          },
          unread: unread,
        };
        this.connection.conversationListMeta[newMessage.conversationId] =
          updatedConversationListMeta;
        this.connection.emit(Events.CONVERSATION_LIST_META_CHANGED, {
          conversationListMeta: this.connection.conversationListMeta,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  private sendReadNotification(data: ReadMessages) {
    if (this.connection.socket) {
      this.connection.socket.send(
        JSON.stringify({
          action: ServerActions.READ_MESSAGES,
          message: { ...data, token: this.connection.wsAccessConfig.token },
        })
      );
    }
  }

  private _clearActiveTypingIndicator(conversationId: string, emit?: boolean) {
    clearTimeout(this.idleTimers[conversationId]);
    delete this.idleTimers[conversationId];
    if (emit === true) {
      this.connection.emit(Events.HAS_STOPPED_TYPING, {
        conversationId,
      });
    }
  }

  private _updateConversationListMetaMessages() {}

  readMessages(conversationId: string, data: ReadMessages) {
    if (this.connection.socket) {
      var socketMessage = {
        action: ServerActions.READ_MESSAGES,
        message: {
          ...data,
          token: this.connection.wsAccessConfig.token,
        },
      };

      this.connection.socket.send(JSON.stringify(socketMessage));
      var conversationMeta =
        this.connection.conversationListMeta[conversationId];
      const updatedConversationListMeta = {
        conversation: conversationMeta.conversation,
        lastMessage: conversationMeta.lastMessage,
        unread: [],
      };
      this.connection.conversationListMeta[conversationId] =
        updatedConversationListMeta;
      this.connection.emit(Events.CONVERSATION_LIST_META_CHANGED, {
        conversationListMeta: this.connection.conversationListMeta,
      });
    }
  }

  //this is to clear notifications for user who hasn't opened chat
  clearUserUnreadNotifications(conversationId: string, ids: string[]) {
    var i = 0;
    var len = ids.length;

    while (i < len) {
      this.connection.emit(Events.EDITED_MESSAGE, {
        message: { messageId: ids[i], messageState: MessageStates.READ },
      });
      i++;
    }
  }

  private wsOnError(error: CloseEvent) {
    this.connection.emit(Events.CONNECTION_CHANGED, {
      isConnected: false,
      connecting: false,
      fetchingConversations: false,
    });
  }

  private deleteMessageFromConversationMeta(
    conversationId: string,
    messageId: string
  ) {
    try {
      const conversationMeta = this.connection.conversationListMeta[conversationId];

      // check if the message being deleted is the last message
      var isLastMessage = messageId === conversationMeta.lastMessage?.messageId;

      if (conversationMeta) {
        const filteredMessages = conversationMeta.conversation.messages.filter(
          (m) => m.messageId !== messageId
        );

        var newLastMessage = filteredMessages[filteredMessages.length - 1];

        var updatedConversationListMeta = {
          ...conversationMeta,
          conversation: {
            ...conversationMeta.conversation,
            messages: filteredMessages,
          }
        };

        if(isLastMessage){
          updatedConversationListMeta.lastMessage = newLastMessage? newLastMessage : null
        }
      
        this.connection.conversationListMeta[conversationId] = updatedConversationListMeta;
      
        this.connection.emit(Events.CONVERSATION_LIST_META_CHANGED, {
          conversationListMeta: this.connection.conversationListMeta,
        });
      } else {
        console.warn(`Conversation with ID ${conversationId} not found.`);
      }
      
    } catch (error) {}
  }

  reactToMessage({
    conversationId,
    messageId,
    reactions,
    to,
  }: {
    conversationId: string;
    messageId: string;
    reactions: Reaction[];
    to: string;
  }) {
    if (this.connection) {
      // this.connection._reactToMessage({ conversationId, messageId, reactions, to });
      this._updateMessageReactions(conversationId, messageId, reactions, {
        ws: true,
        to,
      });
    }
  }

  // updateReactions({
  //   conversationId,
  //   messageId,
  //   reactions,
  //   to,
  // }: {
  //   conversationId: string;
  //   messageId: string;
  //   reactions: Reaction[];
  //   to: string;
  // }) {
  //   if(this.connection) {
  //     this._updateMessageReactions(
  //       conversationId,
  //       messageId,
  //       reactions,
  //       { ws: true, to }
  //     );
  //   }
  // }

  sendMessage(newMessage: Prettify<SendMessageGenerics<Message>>) {
    if (this.connection) {
      const messageId = generateId();
      var timeStamps = generateFillerTimestamps();
      var messageOwner = {
        ...this.connection.userMeta,
        ...timeStamps,
      };
      const messageStruct: Message = {
        ...newMessage,
        quotedMessageId: newMessage?.quotedMessage?.messageId,
        from: messageOwner.uid,
        lastEdited: null,
        messageState: MessageStates.LOADING,
        messageOwner,
        messageId,
        ...timeStamps,
      };
      this._createMessage(messageStruct);
    }
  }

  editMessage(message: Omit<EditedMessage, "from">) {
    if (this.connection) {
      this._editMessage({
        ...message,
        from: this.connection.userMeta.uid,
      });
    }
  }

  sendTypingNotification(uid: string) {
    console.log(this.screen, this.connection.activeConversationId);
    if (this.connection) {
      this._sendTypingNotification(uid);
    }
  }

  sendStoppedTypingNotification(uid: string) {
    if (this.connection) {
      this._sendStoppedTypingNotification(uid);
    }
  }

  deleteMessage(messageId: string, to: string, conversationId: string) {
    if (this.connection) {
      this.connection.socket.send(
        JSON.stringify({
          action: ServerActions.DELETE_MESSAGE,
          message: {
            messageId,
            to,
            conversationId,
            conversationType: this.getConversationType(),
            token: this.connection.wsAccessConfig.token,
          },
        })
      );
      this.connection.emit(Events.DELETED_MESSAGE, {
        message: {
          conversationId,
          messageId,
        },
      });
      this.deleteMessageFromConversationMeta(conversationId, messageId)
    }
  }

  async getMessages(page?: number) {
    if (this.connection) {
      try {
        console.log(
          this.connection.activeConversationId,
          "--this.connection.activeConversationId messages"
        );
        const response = await GET_MESSAGES<{ messages: Message[] }>(
          this.connection.wsAccessConfig.token,
          this.connection.activeConversationId,
          page
        );
        if (response.success) {
          const sortedMessages = [...response.data.messages].sort((a, b) => {
            const dateA = moment(a.createdAt).valueOf();
            const dateB = moment(b.createdAt).valueOf();
            return dateA - dateB;
          });
          return sortedMessages;
        } else {
          return [];
        }
      } catch (err) {
        console.error(err);
        return [];
      }
    } else {
      return [];
    }
  }

  async getEmojiList() {
    if (this.connection) {
      try {
        const response = await GET_EMOJIS<{ gifs: Emoticon[] }>(
          this.connection.wsAccessConfig.token
        );
        return response.data.gifs;
      } catch (err) {
        return [];
      }
    } else {
      return [];
    }
  }

  async uploadAttachment({
    base64,
    fileKey,
  }: {
    base64: string;
    fileKey: string;
  }) {
    if (this.connection) {
      try {
        const res = await UPLOAD_MEDIA<{ url: string }>(
          this.connection.wsAccessConfig?.token,
          {
            base64,
            conversationId: this.connection.activeConversationId,
            key: fileKey,
          }
        );
        return res;
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        }
      }
    } else {
      throw new Error("No connection established");
    }
  }

  // async uploadAttachmentV2({
  //   base64,
  //   fileKey,
  //   mediaType
  // }: {
  //   base64: string;
  //   fileKey: string;
  //   mediaType: MediaType
  // }) {
  //   if (this.connection) {
  //     try {
  //       const res = await UPLOAD_ATTACHMENT<{ url: string }>(
  //         this.connection.wsAccessConfig?.token,
  //         { base64, conversationId: this.connection.activeConversationId, key: fileKey, mediaType }
  //       );
  //       return res;
  //     } catch (error) {
  //       if (error instanceof Error) {
  //         console.error(error.message);
  //       }
  //     }
  //   } else {
  //     throw new Error("No connection established");
  //   }
  // }
  private isReadableStream(uri: any): uri is Readable {
    return uri && typeof uri.pipe === "function";
  }

  async uploadFile(
    uri: string | NodeJS.ReadableStream | Buffer | File,
    meta: {
      filename: string;
      mimeType: string;
    }
  ) {
    try {
      // Get the presigned URL for upload
      const res = await GET_PRESIGNED_URL<{
        uploadUrl: string;
        s3Link: string;
      }>(this.connection.wsAccessConfig?.token, {
        base64: "",
        conversationId: this.connection.activeConversationId,
        key: generateId(),
        mediaType: meta.mimeType,
      });

      console.log(res);

      let body;

      let fileSize = 0; // Initialize file size

      if (typeof uri === "string") {
        const response = await fetch(uri); // Fetch the file data from URI
        body = await response.blob(); // Convert it to a Blob
        fileSize = body.size;
      }
      // Check if the input is a File object (e.g., browser)
      else if (uri instanceof File) {
        body = uri;
        fileSize = uri.size;
      }
      // Check if the input is a Buffer (Node.js)
      else if (Buffer.isBuffer(uri)) {
        body = new Blob([uri], { type: meta.mimeType });
        fileSize = uri.length;
      }
      // Check if the input is a Node.js Readable stream
      else if (this.isReadableStream(uri)) {
        const chunks: any[] = [];
        let totalSize = 0;
        for await (const chunk of uri) {
          chunks.push(chunk);
          totalSize += chunk.length; // Accumulate size
        }
        const buffer = Buffer.concat(chunks);
        body = new Blob([buffer], { type: meta.mimeType });
        fileSize = totalSize;
      }

      const data = await fetch(res.data.uploadUrl, {
        method: "PUT",
        body: body,
        headers: {
          "Content-Type": meta.mimeType,
        },
      });

      console.log("up: ", data);
      return {
        link: res.data.s3Link,
        success: res.success,
        fileSize,
      };
    } catch (error) {
      console.error("Error uploading file: ", error);
      throw error;
    }
  }

  async uploadAttachmentV2({
    base64,
    fileKey,
    mediaType,
    mimeType,
  }: {
    base64: string;
    fileKey: string;
    mediaType: MediaType;
    mimeType: string;
  }) {
    if (this.connection) {
      try {
        //       const formData = new FormData();

        //       // Convert the file at the URI to a Blob (or similar) for FormData
        //       const file = {
        //         uri: data.uri, // local file URI
        //         name: data.name, // filename
        //         type: data.type, // content type
        //       };
        // console.log(file)
        //       // Append the file and other form data
        //       formData.append('file', file as any);
        const res = await GET_PRESIGNED_URL<{
          uploadUrl: string;
          s3Link: string;
        }>(this.connection.wsAccessConfig?.token, {
          base64,
          conversationId: this.connection.activeConversationId,
          key: generateId(),
          mediaType,
        });
        const data = await fetch(res.data.uploadUrl, {
          method: "PUT",
          body: {
            base64,
            fileKey,
            mediaType,
          } as any,
          headers: {
            "Content-Type": mimeType,
          },
        });
        console.log("up: ", data);
        return res;
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        }
      }
    } else {
      throw new Error("No connection established");
    }
  }

  async setActiveConversation() {
    if (this.connection) {
      // this.connection.activeConversationId = conversationId;
      this.connection.screen = Screens.CHAT;
      this.screen = Screens.CHAT;
    } else {
      throw new Error("No connection established");
    }
  }

  async unSetActiveConversation() {
    if (this.connection) {
      this.connection.activeConversationId = "";
      this.connection.screen = Screens.CONVERSATIONS;
      this.screen = Screens.CONVERSATIONS;
    } else {
      throw new Error("No connection established");
    }
  }

  messageEventHandler(event: MessageEvent) {
    try {
      // this.connection.socket.onmessage = (event: MessageEvent) => {
      // console.log(event, '---event')

      if (!event) return null;
      var wsData = JSON.parse(event.data);
      // console.log(wsData)
      const action: ClientActions | ServerActions = wsData.action;
      // console.log("action::::::", action);
      // if(action === ClientActions.INCOMING_MESSAGE){
      //   console.log(event.data)
      //   console.log(this.connection.activeConversationId, '::activeConversationId');
      //   console.log(this.connection.screen ,
      //     this.connection.activeConversationId , wsData?.message?.conversationId)
      // }

      if (
        this.screen === Screens.CHAT &&
        this.connection.activeConversationId === wsData?.message?.conversationId
        // this.connection.activeConversationId === wsData?.message?.conversationId
      ) {
        // read messages if user is still on the screen
        if (action === ClientActions.INCOMING_MESSAGE) {
          const {
            message: incomingMessagePayload,
          }: WsPayLoad<ServerActions, Message> = JSON.parse(event.data);

          // clear typing indicator timeout
          this._clearActiveTypingIndicator(
            this.connection.activeConversationId,
            true
          );

          this.sendReadNotification({
            uid: incomingMessagePayload.from,
            messageIds: [incomingMessagePayload.messageId],
          });
        }

        // to read the message as they come in
        if (action === ClientActions.MESSAGES_READ) {
          const {
            message: readMessagesPayload,
          }: WsPayLoad<
            ClientActions,
            ReadMessages & { conversationId: string }
          > = wsData;
          // const existingConversationForRead = this.connection.conversationMap[readMessagesPayload.conversationId]
          if (
            // existingConversationForRead &&
            this.screen === Screens.CHAT &&
            this.connection.activeConversationId ===
              readMessagesPayload.conversationId
          ) {
            setTimeout(() => {
              this.clearUserUnreadNotifications(
                readMessagesPayload.conversationId,
                readMessagesPayload.messageIds
              );
            }, CLEAR_UNREAD_TIMEOUT);
          }
        }
      }
      switch (action) {
        case ClientActions.MESSAGES_READ:
          const {
            message: readMessagesPayload,
          }: WsPayLoad<
            ClientActions,
            ReadMessages & { conversationId: string }
          > = wsData;
          const existingConversationForRead =
            this.connection.conversationMap[readMessagesPayload.conversationId];
          if (existingConversationForRead && this.screen === Screens.CHAT) {
            setTimeout(() => {
              // if user reads message immediately, then they are online
              // this.updateActiveConversations(readMessagesPayload.conversationId);
              this.clearUserUnreadNotifications(
                readMessagesPayload.conversationId,
                readMessagesPayload.messageIds
              );
            }, CLEAR_UNREAD_TIMEOUT);
          }
          break;
        case ClientActions.INCOMING_MESSAGE:
          const {
            message: incomingMessagePayload,
          }: WsPayLoad<
            ClientActions,
            {
              message: Message;
              senderMeta: UserMeta;
              conversationType: ConversationType;
            }
          > = wsData;
          var incomingMessage = incomingMessagePayload.message;
          const existingConversation =
            this.connection.conversationMap[incomingMessage.conversationId];
          this._clearActiveTypingIndicator(
            incomingMessage.conversationId,
            true
          );

          if (existingConversation) {
            this.addMessageToConversation(incomingMessage, this.screen);
          } else {
            const newConversationId =
              incomingMessagePayload.conversationType === "private-chat"
                ? generateConversationId(
                    incomingMessage.from,
                    incomingMessage.to
                  )
                : incomingMessagePayload.message.conversationId;
            const newMessage = {
              ...incomingMessage,
              messageId: generateId(),
              messageState: MessageStates.SENT,
              createdAt: new Date(),
            };
            var newConversation = {
              participants: [newMessage.from, newMessage.to],
              conversationId: generateConversationId(
                newMessage.from,
                newMessage.to
              ),
              messages: [newMessage],
              admins: [newMessage.from],
              meta: null,
              groupMeta: null,
              conversationType: incomingMessagePayload.conversationType,
              participantList: [
                {
                  id: generateId(),
                  uid: newMessage.from,
                  connectionId: "--",
                  participantId: newMessage.from,
                  projectId: "--",
                  participantDetails: {
                    // projectId: "--",
                    // uid: this.connection.userMeta.uid,
                    // connectionId: "--",
                    // meta: incomingMessagePayload.senderMeta,
                    ...incomingMessagePayload.senderMeta,
                    ...generateFillerTimestamps(),
                  },
                  ...generateFillerTimestamps(),
                },
                {
                  id: generateId(),
                  uid: newMessage.to,
                  connectionId: "--",
                  participantId: newMessage.to,
                  projectId: "--",
                  participantDetails: {
                    // projectId: "--",
                    // uid: this.connection.userMeta.uid,
                    // connectionId: "--",
                    // meta: this.connection.userMeta,
                    ...this.connection.userMeta,
                    ...generateFillerTimestamps(),
                  },
                  ...generateFillerTimestamps(),
                },
              ],
              ...generateFillerTimestamps(),
            };

            const newConversationMeta = {
              conversation: newConversation,
              lastMessage: newMessage,
              unread: [],
            };
            this.connection.conversationListMeta[newConversationId] =
              newConversationMeta;
            this.connection.emit(Events.CONVERSATION_LIST_META_CHANGED, {
              conversationListMeta: this.connection.conversationListMeta,
            });
          }
          break;
        case ClientActions.USER_IS_TYPING:
          const {
            message: userTypingPayload,
          }: WsPayLoad<
            ClientActions,
            { conversationId: string; action: "START" | "STOP" }
          > = wsData;

          this.showTypingIndicator(
            userTypingPayload.conversationId,
            userTypingPayload.action
          );
          break;
        case ClientActions.NEW_MESSAGE_REACTION:
          const {
            message: messageReactionPayload,
          }: WsPayLoad<
            ClientActions,
            {
              conversationId: string;
              messageId: string;
              from: string;
              to: string;
              reactions: Reaction[];
            }
          > = wsData;
          this._updateMessageReactions(
            messageReactionPayload.conversationId,
            messageReactionPayload.messageId,
            messageReactionPayload.reactions
          );
          break;
        case ClientActions.MESSAGE_ERROR:
          const {
            message: errorPayload,
          }: WsPayLoad<ClientActions, { error: string }> = wsData;
          console.error(
            "Failed to send message, please try again",
            errorPayload
          );
          break;
        case ClientActions.EDITED_MESSAGE:
          const {
            message: editedMessage,
          }: WsPayLoad<ClientActions, EditedMessage> = wsData;
          this._clearActiveTypingIndicator(editedMessage.conversationId, true);
          this.storeEditedMessage(editedMessage);
          break;
        case ClientActions.MESSAGE_DELETED:
          const {
            message: deletedMessage,
          }: WsPayLoad<ClientActions, DeletedMessage> = wsData;
          this.connection.emit(Events.DELETED_MESSAGE, {
            message: deletedMessage,
          });
          break;
        case ClientActions.ACK_HEALTH_CHECK:
          console.info("HEALTH_CHECK: ok!");
          break;
        default:
          console.log("Unknown action recieved", JSON.parse(event.data));
      }

      this.connection.socket.onerror = (error: CloseEvent) => {
        this.wsOnError(error);
      };
      // }
    } catch (error) {
      console.error(error);
    }
  }
}
