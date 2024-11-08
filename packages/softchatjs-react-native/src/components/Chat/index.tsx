import React, {
  MutableRefObject,
  RefObject,
  createRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  RefreshControl,
} from "react-native";
import {
  ChatBubbleRenderProps,
  ChatHeaderRenderProps,
  ChatInputRenderProps,
  Children,
  AttachmentTypes,
  Prettify
} from "../../types";
import { ChatItem } from "./ChatItem";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ChatInput, { METERING_MIN_POWER } from "./ChatInput";
import ChatHeader from "./ChatHeader";
import SelectedMessage from "./SelectedMessage";
import EmojiSheet from "./EmojiSheet";
import MediaOptions from "./MediaOptions";
import { restructureMessages } from "../../utils";
import MessageOptions from "./MessageOptions";
import Haptics from "../../helpers/haptics";
import { FlashList } from "@shopify/flash-list";
import { useConfig } from "../../contexts/ChatProvider";
import {
  ChatEventGenerics,
  ConnectionEvent,
  Events,
  generateConversationId,
  generateId,
  Message,
  Conversation,
  MediaType,
  UserMeta,
  ConversationListMeta,
  ConversationListItem
} from "softchatjs-core";
import { BottomSheetRef } from "../BottomSheet";
import { format, isThisWeek } from "date-fns";
import { useMessageState } from "../../contexts/MessageStateContext";
import { LockIcon, MessagePlus } from "../../assets/icons";
import { Audio } from "expo-av";
import { interpolate } from "react-native-reanimated";

type ChatProps = {
  activeConversation: ConversationListItem
  layout?: "stacked";
  // chatUser: UserMeta;
  renderChatBubble?: (props: Prettify<ChatBubbleRenderProps>) => void;
  renderChatInput?: (props: Prettify<ChatInputRenderProps>) => void;
  renderChatHeader?: (props: Prettify<ChatHeaderRenderProps>) => void;
  placeholder?: Children;
  keyboardOffset?: number;
};

export type SendMessage = {
  message: string;
};

export type SelectedMessage = {
  message: Message | null;
  ref: MutableRefObject<View | undefined> | null;
  itemIndex: number;
  isMessageOwner: boolean;
};

type GroupedMessages = Array<string | Message>;

export default function Chat(props: ChatProps) {
  const { client, theme, fontFamily } = useConfig();
  const {
    layout,
    activeConversation,
    renderChatBubble,
    renderChatInput,
    renderChatHeader,
    placeholder,
    keyboardOffset = Platform.OS === "ios" ? 10 : 0,
  } = props;
  const chatUserId = client.chatUserId
  const conversationId = activeConversation.conversation.conversationId;
  const participantList = activeConversation.conversation.participantList
  const participants = activeConversation.conversation.participants
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const scrollRef = useRef<FlashList<Message | string> | null>(null);
  const inputRef = useRef<TextInput>(null);
  const emojiListRef = useRef<BottomSheetRef>(null);
  const mediaOptionsRef = useRef<
    BottomSheetRef & { pickAttachment: () => void }
  >(null);
  const messageOptionsRef = useRef<BottomSheetRef>(null);
  const [isTyping, showTyping] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const {
    globalTextMessage,
    setGlobalTextMessage,
    pendingMessages,
    pauseVoiceMessage,
    addNewPendingMessages,
    activeVoiceMessage,
    unload,
  } = useMessageState();

  const [messages, setMessages] = useState<Array<string | Message>>([...activeConversation.conversation.messages.reverse()]);
  const [isEditing, setIsEditing] = useState(false);
  const [refMap, setRefMap] = useState<{
    [key: string]: { ref: RefObject<View> | null; index: number };
  }>({});
  const [viewable, setViewable] = useState<GroupedMessages>([]);
  const [isScrolling, setIsScrolling] = useState(false);
  const [currentPage, setCurrentPage] = useState(2);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const [recipientId, setRecipientId] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<ConnectionEvent>({
    isConnected: false,
    fetchingConversations: false,
    connecting: false,
  });
  const width = Dimensions.get("window").width;
  const emojiSize = 40;

  const [selectedMessage, setSelectedMessage] = useState<SelectedMessage>({
    message: null,
    ref: null,
    itemIndex: 0,
    isMessageOwner: false,
  });
  // quoted message and ref
  const [activeQuote, setActiveQuote] = useState<
    Omit<SelectedMessage, "isMessageOwner">
  >({
    message: null,
    ref: null,
    itemIndex: 0,
  });
  const [audioTime, setAudioTime] = useState(0);
  const [audioWaves, setAudioWaves] = useState<{
    [key: number]: { metering: number; height: number };
  }>({});
  const [recording, setRecording] = useState<Audio.Recording>();
  // const onViewRef = useRef((viewableItems: any) => {
  //   let Check = [];
  //   for (var i = 0; i < viewableItems.viewableItems.length; i++) {
  //     Check.push(viewableItems.viewableItems[i].item);
  //   }
  //   setViewable(Check);
  // });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 80 });

  // const conversationId = useMemo(() => {
  //   try {
  //     if(!participantId && !conversationId){
  //       throw new Error('ConversationId and Participant cannot be null')
  //     }
  //     if(participantId && conversationId){
  //       throw new Error('One of ConversationId or Participant can be passed but not both.')
  //     }
  //     return participantId? generateConversationId(chatUser.uid, participantId, client.projectId) : conversationId;
  //   } catch (error) {
  //     throw new Error(error.message)
  //   }

  // },[participantId, chatUser, client, conversationId]);

  useEffect(() => {
    setRefMap((prevMap) => {
      const newMap: {
        [key: string]: { ref: RefObject<View> | null; index: number };
      } = { ...prevMap };
      messages.forEach((message, index) => {
        if (typeof message === "string") {
          if (!newMap[message]) {
            newMap[message] = { ref: createRef<View>(), index };
          } else {
            newMap[message].index = index;
          }
        } else {
          if (!newMap[message.messageId]) {
            newMap[message.messageId] = { ref: createRef<View>(), index };
          } else {
            newMap[message.messageId].index = index;
          }
        }
      });
      return newMap;
    });
  }, [messages]);

  const clearSelectedMessage = () =>
    setActiveQuote({ message: null, ref: null, itemIndex: 0 });

  async function getMessages() {
    try {
        setLoadingMessages(true);
        const messages = (await client
          ?.messageClient(conversationId)
          .getMessages()) as Array<Message>;
        if (messages.length > 0) {
          var restructuredMessages: GroupedMessages = restructureMessages(
            messages.reverse()
          );
          setMessages(restructuredMessages);
        }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingMessages(false);
    }
  }

  async function getOlderMessages() {
    try {
      if (client && messages.length > 0) {
        setLoadingOlderMessages(true);
        const olderMessages = (await client
          .messageClient(conversationId)
          .getMessages(currentPage)) as Array<Message>;
        setMessages((prev) => {
          return restructureMessages([...prev, ...olderMessages.reverse()]);
        });
        if (olderMessages.length > 0) {
          setCurrentPage((prev) => prev + 1);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingOlderMessages(false);
    }
  }

  // const getConversation = async () => {
  //   try {
  //     if (client) {
  //       const conversation = (await client
  //         ?.messageClient(conversationId)
  //         .getConversation(conversationId)) as Conversation;
  //       console.log(conversation, "---the conversation");
  //       if (conversation) {
  //         setConversationMeta(conversation);
  //       }
  //     }
  //   } catch (error) {}
  // };

  useEffect(() => {
    // if (conversation) {
      const recipients = participants.filter(
        (id) => id !== client?.chatUserId
      );
      if (recipients && recipients.length > 0) {
        setRecipientId(recipients[0]);
      }
    getMessages();
  }, []);

  const handleNewMessages = (event: any) => {
    try {
      // console.log(client.)
      // return console.log(event)
      setMessages((prev) => {
        return restructureMessages([event.message, ...prev]);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditedMessage = (event: any) => {
    setMessages((prev) => {
      const newMessages = [...prev];
      return newMessages.map((message) => {
        if (
          typeof message !== "string" &&
          message.messageId === event.message.messageId
        ) {
          return { ...message, ...event.message };
        }
        return message;
      });
    });
  };

  const handleTypingStarted = (event: any) => {
    if (event.conversationId === conversationId) {
      showTyping(true);
    }
  };

  const handleStoppedStarted = (event: any) => {
    if (event.conversationId === conversationId) {
      showTyping(false);
    }
  };

  const handleDeletedMessage = (event: any) => {
    setMessages((prev) => {
      var prevMessage = prev.filter((message) => {
        if (typeof message !== "string") {
          return message.messageId !== event.message.messageId;
        }
      });
      return restructureMessages(prevMessage);
    });
  };

  const handleConnectionChanged = (
    event: ChatEventGenerics<ConnectionEvent>
  ) => {
    setConnectionStatus(event);
  };

  useEffect(() => {
    if (client && conversationId) {
      client.messageClient(conversationId).setActiveConversation();
      client.subscribe(Events.NEW_MESSAGE, handleNewMessages);
      client.subscribe(Events.EDITED_MESSAGE, handleEditedMessage);
      client.subscribe(Events.HAS_STARTED_TYPING, handleTypingStarted);
      client.subscribe(Events.HAS_STOPPED_TYPING, handleStoppedStarted);
      client.subscribe(Events.DELETED_MESSAGE, handleDeletedMessage);
      client.subscribe(Events.CONNECTION_CHANGED, handleConnectionChanged);
    }
    return () => {
      if (client) {
        if (conversationId) {
          client.messageClient(conversationId).unSetActiveConversation();
        }
        client.unsubscribe(Events.NEW_MESSAGE, handleNewMessages);
        client.unsubscribe(Events.EDITED_MESSAGE, handleEditedMessage);
        client.unsubscribe(Events.HAS_STARTED_TYPING, handleTypingStarted);
        client.unsubscribe(Events.HAS_STOPPED_TYPING, handleStoppedStarted);
        client.unsubscribe(Events.DELETED_MESSAGE, handleDeletedMessage);
        client.unsubscribe(Events.CONNECTION_CHANGED, handleConnectionChanged);
      }
    };
  }, [client, conversationId]);

  const openEmojis = () => {
    emojiListRef?.current?.open();
    inputRef?.current?.blur();
  };

  const sendMessage = async () => {
    try {
      if (!globalTextMessage) return null;
      if (conversationId) {
        if (client) {
          client.messageClient(conversationId).sendMessage({
            conversationId: conversationId,
            to: recipientId,
            message: globalTextMessage,
            reactions: [],
            attachedMedia: [],
            attachmentType: AttachmentTypes.NONE,
            quotedMessage: activeQuote.message,
          });
        }
        setGlobalTextMessage("");
        setIsEditing(false);
        clearSelectedMessage();
        if (activeQuote.message) {
          clearSelectedMessage();
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const sendEditedMessage = async (externalInputRef?: RefObject<TextInput>) => {
    try {
      if (client && selectedMessage.message) {
        client
          .messageClient(selectedMessage.message.conversationId)
          .editMessage({
            to: selectedMessage.message.to,
            conversationId: selectedMessage.message.conversationId,
            messageId: selectedMessage.message.messageId,
            textMessage: globalTextMessage,
            shouldEdit: true,
          });
        setGlobalTextMessage("");
        clearSelectedMessage();
        setIsEditing(false);
        if (externalInputRef && externalInputRef.current) {
          externalInputRef.current?.blur();
        } else {
          inputRef.current?.blur();
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const sendVoiceMessage = async () => {
    try {
      setRecording(undefined);
      await recording?.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = recording?.getURI();
      if (client) {
        // remove any audio being played
        pauseVoiceMessage();
        addNewPendingMessages({
          from: client.chatUserId,
          messageId: generateId(),
          conversationId: conversationId,
          to: recipientId,
          message: "",
          reactions: [],
          attachedMedia: [
            {
              type: MediaType.AUDIO,
              ext: "audio/mp3",
              mediaId: generateId(),
              mediaUrl: uri as string,
              mimeType: "audio/mp3",
              meta: {
                audioDurationSec: audioTime,
              },
            },
          ],
          attachmentType: AttachmentTypes.MEDIA,
          quotedMessage: null,
          createdAt: new Date(),
        });
        setAudioWaves({});
        setAudioTime(0);
      }
    } catch (err) {
      setAudioWaves({});
      setAudioTime(0);
      setRecording(undefined);
      console.error(err);
    }
  };

  const onChatItemLongPress = (
    selectedMessage: Message,
    ref: MutableRefObject<View | undefined>,
    isMessageOwner: boolean
  ) => {
    const messageIndex = messages.indexOf(selectedMessage);
    setSelectedMessage({
      message: selectedMessage,
      ref: ref,
      itemIndex: messageIndex,
      isMessageOwner,
    });
    messageOptionsRef?.current?.open();
    Haptics.medium();
  };

  const onScrollToMessage = (messageId: string) => {
    try {
      const itemRef = refMap[messageId].ref?.current;
      scrollRef.current?.scrollToIndex({
        animated: true,
        index: refMap[messageId].index,
        viewPosition: 0.5,
      });
      if (itemRef) {
        itemRef.setNativeProps({
          style: { backgroundColor: theme?.background.secondary },
        });
        setTimeout(() => {
          itemRef.setNativeProps({
            style: { backgroundColor: "transparent" },
          });
        }, 1000);
      }
    } catch (error) {
      scrollRef.current?.scrollToEnd({
        animated: true,
      });
    }
  };

  function formatViewableDate(date: Date | string): string {
    if (isThisWeek(date, { weekStartsOn: 1 })) {
      // weekStartsOn: 1 makes the week start on Monday
      return format(date, "EEEE"); // 'EEEE' returns the full weekday name (e.g., 'Monday')
    } else {
      return format(date, "yyyy-MM-dd"); // returns full date (e.g., '2024-09-13')
    }
  }

  const threaded = (item: string | Message, index: number) => {
    var nextMessage = messages[index - 1];
    if (typeof item === "string") {
      return false;
    }
    if (typeof nextMessage === "string" || !nextMessage) {
      return false;
    }
    return item.messageOwner.uid === nextMessage.messageOwner.uid;
  };

  useEffect(() => {
    let debounceTimer: NodeJS.Timeout | undefined;
    let idleTimer: NodeJS.Timeout | undefined;
    if (conversationId) {
      if (globalTextMessage.length > 0) {
        clearTimeout(debounceTimer);
        // set a new debounce timer to send a typing notification after 350ms
        debounceTimer = setTimeout(() => {
          if (client) {
            client
              .messageClient(conversationId)
              .sendTypingNotification(recipientId);
            debounceTimer = undefined; // clear debounce timer reference after sending the typing notification
          }
        }, 300);
        // clear the previous idle timer (stopped typing)
        clearTimeout(idleTimer);
        // set a new idle timer to send a stopped typing notification after 1300ms of inactivity
        idleTimer = setTimeout(() => {
          if (client) {
            client
              .messageClient(conversationId)
              .sendStoppedTypingNotification(recipientId);
          }
        }, 1300);
      }
    }
    return () => clearTimeout(debounceTimer);
  }, [client, globalTextMessage, conversationId]);

  useEffect(() => {
    if (client && conversationId) {
      const msClient = client.messageClient(conversationId);
      msClient.readMessages(conversationId, {
        uid: client.chatUserId,
        messageIds: activeConversation.unread,
      });

    }
  }, [client, conversationId, activeConversation]);

  const onStartedScrolling = () => {
    let scrollStateRef: NodeJS.Timeout | undefined = undefined;
    setIsScrolling(true);
    clearTimeout(scrollStateRef);
    scrollStateRef = setTimeout(() => {
      setIsScrolling(false);
    }, 3000);
  };

  const onRecordingStatusUpdate = (data: Audio.RecordingStatus) => {
    var durationSecond = data.durationMillis / 1000;
    var metering = data.metering ?? -160;
    if (durationSecond >= 300) {
    }
    var interp = interpolate(metering, [METERING_MIN_POWER, 0], [1, 100]);
    setAudioWaves((prev) => {
      return { ...prev, [durationSecond]: { metering, height: interp } };
    });
    setAudioTime(durationSecond);
  };

  async function startRecording() {
    try {
      if (permissionResponse?.status !== "granted") {
        await requestPermission();
      }
      // pause any audio being played
      pauseVoiceMessage();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.LOW_QUALITY,
        onRecordingStatusUpdate
      );
      setRecording(recording);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function deleteRecording() {
    setRecording(undefined);
    setAudioWaves({});
    // setIsRecordingPaused(false)
    await recording?.stopAndUnloadAsync();
  }

  const renderMessageOptions = useCallback(() => {
    return (
      <MessageOptions
        ref={messageOptionsRef}
        recipientId={recipientId}
        message={selectedMessage.message}
        isMessageOwner={selectedMessage.isMessageOwner}
        onReply={() => {
          messageOptionsRef?.current?.close();
          setTimeout(() => {
            setActiveQuote(selectedMessage);
            inputRef.current?.focus();
          }, 500);
        }}
        onStartEditing={() => {
          messageOptionsRef?.current?.close();
          setIsEditing(true);

          setTimeout(() => {
            inputRef?.current?.focus();
            setGlobalTextMessage(selectedMessage.message?.message || "");
          }, 500);
        }}
        theme={theme}
      />
    );
  }, [
    selectedMessage,
    recipientId,
    messageOptionsRef,
    inputRef,
    messageOptionsRef,
    setIsEditing,
    theme,
  ]);

  const messageListHeader = useCallback(() => {
    return (
      <View style={{ width: "100%" }}>
        {pendingMessages
          .filter((message) => message.conversationId === conversationId)
          .map((message, index) => (
            <ChatItem
              key={index}
              ref={null}
              onScrollToIndex={(messageId) => {}}
              layout={layout}
              onLongPress={({ message, chatItemRef, isMessageOwner }) => {}}
              inputRef={inputRef}
              position={chatUserId === message.from ? "right" : "left"}
              message={message as Message}
              onSelectedMessage={({ message, chatItemRef }) => {}}
              conversation={activeConversation.conversation}
              chatUserId={chatUserId}
              recipientId={recipientId}
              renderChatBubble={renderChatBubble}
              isPending={true}
            />
          ))}
      </View>
    );
  }, [loadingMessages, pendingMessages, theme]);

  const renderChatItem = useCallback(
    ({ item, index }: { item: string | Message; index: number }) => {
      if (typeof item === "string") {
        if (layout !== "stacked") {
          return (
            <View
              style={{
                alignSelf: "center",
                padding: 5,
                marginTop: 5,
                backgroundColor: theme?.background.secondary,
                borderRadius: 10,
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  paddingHorizontal: 5,
                  color: theme?.text.secondary,
                  fontSize: 11,
                  fontFamily: fontFamily || undefined,
                }}
              >
                {item}
              </Text>
            </View>
          );
        }
        return (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 20,
              backgroundColor: theme?.background.primary,
            }}
          >
            <View
              style={{
                height: 1,
                width: "100%",
                flex: 1,
                backgroundColor: theme?.divider,
              }}
            />
            <Text
              style={{
                textAlign: "center",
                paddingHorizontal: 15,
                color: theme?.text.secondary,
                fontSize: 11,
                fontFamily: fontFamily || undefined,
              }}
            >
              {item}
            </Text>
            <View
              style={{
                height: 1,
                width: "100%",
                flex: 1,
                backgroundColor: theme?.divider,
              }}
            />
          </View>
        );
      }

      return (
        <ChatItem
          ref={refMap[item.messageId]?.ref}
          onScrollToIndex={(messageId) => {
            onScrollToMessage(messageId);
          }}
          layout={layout}
          onLongPress={({ message, chatItemRef, isMessageOwner }) =>
            activeConversation.conversation.conversationType !== "admin-chat"
              ? onChatItemLongPress(message, chatItemRef, isMessageOwner)
              : null
          }
          inputRef={inputRef}
          position={chatUserId === item.from ? "right" : "left"}
          message={item}
          onSelectedMessage={({ message, chatItemRef }) => {
            setActiveQuote({ message, ref: chatItemRef, itemIndex: index });
          }}
          threaded={threaded(item, index)}
          conversation={activeConversation.conversation}
          chatUserId={chatUserId}
          recipientId={recipientId}
          renderChatBubble={renderChatBubble}
        />
      );
    },
    [activeConversation, renderChatBubble, refMap, theme, layout]
  );

  const renderPlaceholder = useCallback(() => {
    if (placeholder) return placeholder;
    return (
      <View
        style={{
          flex: 1,
          height: Dimensions.get("window").height,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MessagePlus size={100} color={theme?.icon} />
        <Text
          style={{
            color: theme?.text.disabled,
            marginTop: 20,
            fontFamily: fontFamily || undefined,
          }}
        >
          Start by sending a message.
        </Text>
      </View>
    );
  }, [placeholder]);

  const chatInputProps: ChatInputRenderProps = {
    sendMessage: (externalInputRef: RefObject<TextInput>) =>
      isEditing ? sendEditedMessage(externalInputRef) : sendMessage(),
    value: globalTextMessage,
    onValueChange: setGlobalTextMessage,
    openMediaOptions: (externalInputRef: RefObject<TextInput>) => {
      mediaOptionsRef?.current?.open();
      externalInputRef?.current?.blur();
    },
    openEmojis,
    onStopEditing: () => {
      setIsEditing(false);
      clearSelectedMessage();
    },
    isRecording: recording !== undefined,
    audioDuration: audioTime,
    onDeleteRecording: deleteRecording,
    onStartRecording: startRecording,
    meteringProgress: audioWaves,
    isEditing,
    sendVoiceMessage: () => sendVoiceMessage(),
    isLoading: connectionStatus.connecting || loadingMessages,
  };

  return (
    <GestureHandlerRootView
      style={{
        ...styles.main,
        backgroundColor: theme?.background.primary,
      }}
    >
      <ChatHeader
        conversation={activeConversation.conversation}
        chatUserId={chatUserId}
        renderChatHeader={renderChatHeader}
        isTyping={isTyping}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={keyboardOffset}
      >
        {messages.length === 0 ? (
          renderPlaceholder()
        ) : (
          <View
            style={{
              flex: 1,
              height: "100%",
            }}
          >
            <FlashList
              ref={scrollRef}
              inverted
              onScroll={() => (isScrolling ? null : onStartedScrolling())}
              data={messages}
              keyExtractor={(_, index) => index.toString()}
              renderItem={renderChatItem}
              refreshControl={
                <RefreshControl refreshing={false} onRefresh={getMessages} />
              }
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={messageListHeader}
              ListFooterComponent={() => (
                <View
                  style={{
                    display: loadingOlderMessages ? "flex" : "none",
                    paddingVertical: 10,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: theme?.text.disabled,
                      fontFamily: fontFamily || undefined,
                    }}
                  >
                    Loading older messages...
                  </Text>
                </View>
              )}
              contentContainerStyle={{
                paddingTop: 0,
              }}
              estimatedItemSize={100}
              // onViewableItemsChanged={onViewRef.current}
              viewabilityConfig={viewConfigRef.current}
              onEndReached={() => {
                getOlderMessages();
              }}
            />
          </View>
        )}

        <View>
          {activeQuote.message && (
            <SelectedMessage
              scrollRef={scrollRef}
              message={activeQuote.message}
              messageRef={activeQuote.ref}
              itemIndex={activeQuote.itemIndex}
              onClear={clearSelectedMessage}
            />
          )}
          {activeConversation.conversation.conversationType === "admin-chat" ? (
            <View
              style={{
                height: 50,
                width: "100%",
                borderTopWidth: 1,
                borderTopColor: theme?.divider,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <LockIcon size={15} color={theme?.icon} />
              <Text
                style={{
                  marginStart: 5,
                  fontFamily: fontFamily || undefined,
                  fontSize: 14,
                  color: theme?.text.disabled,
                }}
              >
                Only the Admin can send messages.
              </Text>
            </View>
          ) : (
            <View>
              <>
                {renderChatInput ? (
                  renderChatInput(chatInputProps)
                ) : (
                  <ChatInput
                    openEmojis={openEmojis}
                    inputRef={inputRef}
                    mediaOptionsRef={mediaOptionsRef}
                    sendMessage={() =>
                      isEditing ? sendEditedMessage() : sendMessage()
                    }
                    isLoading={connectionStatus.connecting || loadingMessages}
                    conversationId={conversationId || ""}
                    chatUserId={chatUserId}
                    recipientId={recipientId}
                    // selectedMessage={activeQuote}
                    value={globalTextMessage}
                    audioWaves={audioWaves}
                    audioTime={audioTime}
                    setValue={setGlobalTextMessage}
                    onStopEditing={() => {
                      setIsEditing(false);
                      clearSelectedMessage();
                    }}
                    isEditing={isEditing}
                    sendVoiceMessage={() => sendVoiceMessage()}
                    onStartRecording={() => startRecording()}
                    onDeleteRecording={() => deleteRecording()}
                    isRecording={recording !== undefined}
                  />
                )}
              </>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
      <EmojiSheet
        ref={emojiListRef}
        openKeyboard={() => inputRef?.current?.focus()}
        sendSticker={sendMessage}
        recipientId={recipientId}
      />
      <MediaOptions
        conversationId={conversationId}
        clearActiveQuote={clearSelectedMessage}
        activeQuote={activeQuote?.message}
        ref={mediaOptionsRef}
        chatUserId={client?.chatUserId as string}
        recipientId={recipientId}
      />
      <>{renderMessageOptions()}</>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    height: "100%",
    width: "100%",
    paddingBottom: Platform.OS === "android" ? 0 : 20,
  },
});
