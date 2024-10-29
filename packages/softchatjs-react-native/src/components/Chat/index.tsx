import React, {
  MutableRefObject,
  RefObject,
  createRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Text,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import {
  AttachmentTypes,
  ChatBubbleRenderProps,
  ChatHeaderRenderProps,
  ChatInputRenderProps,
  Conversation,
  Message,
  UserMeta,
} from "../../types";
import { ChatItem } from "./ChatItem";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ChatInput from "./ChatInput";
import ChatHeader from "./ChatHeader";
import SelectedMessage from "./SelectedMessage";
import EmojiSheet from "./EmojiSheet";
import MediaOptions from "./MediaOptions";
import { restructureMessages } from "../../utils";
import MessageOptions from "./MessageOptions";
import Haptics from "../../helpers/haptics";
import { FlashList } from "@shopify/flash-list";
import { useConfig } from "../../contexts/ChatProvider";
import { Events } from "softchatjs-core";
import { BottomSheetRef } from "../BottomSheet";
import { format, isThisWeek } from "date-fns";
import { useMessageState } from "../../contexts/MessageStateContext";
import { MessagePlus } from "../../assets/icons";

type ChatProps = {
  conversationId: string;
  unread: string[];
  conversation: Conversation;
  layout?: "stacked";
  chatUser: UserMeta;
  renderChatBubble?: (props: ChatBubbleRenderProps) => void;
  renderChatInput?: (props: ChatInputRenderProps) => void;
  renderChatHeader?: (props: ChatHeaderRenderProps) => void;
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
  const { client, theme } = useConfig();
  const {
    layout,
    conversationId,
    unread,
    renderChatBubble,
    renderChatInput,
    renderChatHeader,
    conversation,
    chatUser,
  } = props;
  const chatUserId = chatUser.uid;
  const scrollRef = useRef<FlashList<Message | string> | null>(null);
  const inputRef = useRef<TextInput>(null);
  const emojiListRef = useRef<BottomSheetRef>(null);
  const mediaOptionsRef = useRef<BottomSheetRef>(null);
  const messageOptionsRef = useRef<BottomSheetRef>(null);
  const [isTyping, showTyping] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const { globalTextMessage, setGlobalTextMessage, pendingMessages } =
    useMessageState();
  const [messages, setMessages] = useState<Array<string | Message>>([
    ...conversation.messages.reverse(),
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [refMap, setRefMap] = useState<{
    [key: string]: { ref: RefObject<View> | null; index: number };
  }>({});
  const [viewable, setViewable] = useState<GroupedMessages>([]);
  const [isScrolling, setIsScrolling] = useState(false);
  const [currentPage, setCurrentPage] = useState(2);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const [recipientId, setRecipientId] = useState("");

  const onViewRef = useRef((viewableItems: any) => {
    let Check = [];
    for (var i = 0; i < viewableItems.viewableItems.length; i++) {
      Check.push(viewableItems.viewableItems[i].item);
    }
    setViewable(Check);
  });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 80 });

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

  const width = Dimensions.get("window").width;
  const emojiSize = 40;
  var noOfColumns = Math.floor(width / emojiSize);

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

  useEffect(() => {
    console.log("re-rendering");
  }, []);

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
      // if(messages.length < 25) {
      //   return null
      // }
      setLoadingOlderMessages(true);
      const olderMessages = (await client
        ?.messageClient(conversationId)
        .getMessages(currentPage)) as Array<Message>;
      setMessages((prev) => {
        return restructureMessages([...prev, ...olderMessages.reverse()]);
      });
      if (olderMessages.length > 0) {
        setCurrentPage((prev) => prev + 1);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingOlderMessages(false);
    }
  }

  useEffect(() => {
    if (conversation) {
      // getMessages();
      const recipients = conversation?.participants.filter(
        (id) => id !== client?.userMeta.uid
      );
      setRecipientId(recipients[0]);
    }
  }, [conversation]);

  const handleNewMessages = (event: any) => {
    try {
      setMessages((prev) => {
        return restructureMessages([event.message, ...prev]);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditedMessage = (event: any) => {
    setMessages((prev) => {
      return prev.map((message) => {
        if (typeof message !== "string") {
          if (message.messageId === event.message.messageId) {
            return { ...message, ...event.message };
          } else {
            return message;
          }
        } else {
          return message;
        }
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
    console.log("new deleted message");
    setMessages((prev) => {
      return prev.filter((message) => {
        if (typeof message !== "string") {
          return message.messageId !== event.message.messageId;
        }
      });
    });
  };

  useEffect(() => {
    if (client) {
      client.messageClient(conversationId).setActiveConversation();
      client.subscribe(Events.NEW_MESSAGE, handleNewMessages);
      client.subscribe(Events.EDITED_MESSAGE, handleEditedMessage);
      client.subscribe(Events.HAS_STARTED_TYPING, handleTypingStarted);
      client.subscribe(Events.HAS_STOPPED_TYPING, handleStoppedStarted);
      client.subscribe(Events.DELETED_MESSAGE, handleDeletedMessage);
    }
    return () => {
      if (client) {
        client.messageClient(conversationId).unSetActiveConversation();
        client.unsubscribe(Events.NEW_MESSAGE, handleNewMessages);
        client.unsubscribe(Events.EDITED_MESSAGE, handleEditedMessage);
        client.unsubscribe(Events.HAS_STARTED_TYPING, handleTypingStarted);
        client.unsubscribe(Events.HAS_STOPPED_TYPING, handleStoppedStarted);
        client.unsubscribe(Events.DELETED_MESSAGE, handleDeletedMessage);
      }
    };
  }, [client]);

  const openEmojis = () => {
    emojiListRef?.current?.open();
    inputRef?.current?.blur();
  };

  const sendMessage = async () => {
    try {
      if (!globalTextMessage) return null;
      if (conversation) {
        if (client) {
          client.messageClient(conversationId).sendMessage({
            conversationId,
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
        console.log("sending -2");
        if (activeQuote.message) {
          clearSelectedMessage();
        }
      }
    } catch (err) {
      console.log(err, "--this error");
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
        console.log("sending edited");
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
              message={message}
              onSelectedMessage={({ message, chatItemRef }) => {}}
              conversation={conversation}
              chatUserId={chatUserId}
              recipientId={recipientId}
              renderChatBubble={renderChatBubble}
              isPending={true}
            />
          ))}
        <View
          style={{
            display: loadingMessages ? "flex" : "none",
            paddingVertical: 5,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: theme?.text.disabled, fontStyle: "italic" }}>
            Loading new messages...
          </Text>
        </View>
      </View>
    );
  }, [loadingMessages, pendingMessages, theme]);

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
            onChatItemLongPress(message, chatItemRef, isMessageOwner)
          }
          inputRef={inputRef}
          position={chatUserId === item.from ? "right" : "left"}
          message={item}
          onSelectedMessage={({ message, chatItemRef }) => {
            setActiveQuote({ message, ref: chatItemRef, itemIndex: index });
          }}
          threaded={threaded(item, index)}
          conversation={conversation}
          chatUserId={chatUserId}
          recipientId={recipientId}
          renderChatBubble={renderChatBubble}
        />
      );
    },
    [conversation, renderChatBubble, refMap, theme, layout]
  );

  const renderMessageOptions = useCallback(() => {
    return (
      <MessageOptions
        ref={messageOptionsRef}
        recipientId={recipientId}
        message={selectedMessage.message}
        isMessageOwner={selectedMessage.isMessageOwner}
        onReply={() => {
          messageOptionsRef?.current?.close();
          setActiveQuote(selectedMessage);
          inputRef.current?.focus();
        }}
        onStartEditing={() => {
          messageOptionsRef?.current?.close();
          inputRef?.current?.focus();
          setIsEditing(true);
          setGlobalTextMessage(selectedMessage.message?.message || "");
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

  useEffect(() => {
    let debounceTimer: NodeJS.Timeout | undefined;
    let idleTimer: NodeJS.Timeout | undefined;
    if (globalTextMessage.length > 0) {
      clearTimeout(debounceTimer);
      // set a new debounce timer to send a typing notification after 350ms
      debounceTimer = setTimeout(() => {
        if (client) {
          client
            .messageClient(conversation.conversationId)
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
            .messageClient(conversation.conversationId)
            .sendStoppedTypingNotification(recipientId);
        }
      }, 1300);
    }
    return () => clearTimeout(debounceTimer);
  }, [client, globalTextMessage, conversation]);

  useEffect(() => {
    if (client && conversation.conversationId) {
      const msClient = client.messageClient(conversation.conversationId);
      msClient.readMessages(conversation.conversationId, {
        uid: client.userMeta.uid,
        messageIds: unread,
      });

      console.log("sent messageIds for read");
    }
  }, [client, conversation, unread]);

  const onStartedScrolling = () => {
    let scrollStateRef: NodeJS.Timeout | undefined = undefined;

    setIsScrolling(true);
    clearTimeout(scrollStateRef);
    scrollStateRef = setTimeout(() => {
      setIsScrolling(false);
    }, 3000);
  };

  return (
    <GestureHandlerRootView
      style={{
        ...styles.main,
        backgroundColor: theme?.background.primary,
      }}
    >
      <ChatHeader
        conversation={conversation}
        chatUserId={chatUserId}
        renderChatHeader={renderChatHeader}
        isTyping={isTyping}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        {messages.length === 0 && (
          <View
            style={{
              flex: 1,
              height: Dimensions.get("window").height,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MessagePlus size={100} color={theme?.icon} />
            <Text style={{ color: theme?.text.disabled, marginTop: 20 }}>
              Start by sending a message.
            </Text>
          </View>
        )}
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
                  style={{ color: theme?.text.disabled, fontStyle: "italic" }}
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
              console.log("end reached");
              getOlderMessages();
            }}
          />
        </View>

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
          <View>
            {renderChatInput ? (
              <>
                {renderChatInput({
                  sendMessage: (externalInputRef: RefObject<TextInput>) =>
                    isEditing
                      ? sendEditedMessage(externalInputRef)
                      : sendMessage(),
                  value: globalTextMessage,
                  onValueChange: (text) => setGlobalTextMessage(text),
                  openMediaOptions: (
                    externalInputRef: RefObject<TextInput>
                  ) => {
                    mediaOptionsRef?.current?.open();
                    externalInputRef?.current?.blur();
                  },
                  openEmojis: () => openEmojis(),
                  onStopEditing: () => {
                    setIsEditing(false);
                    clearSelectedMessage();
                  },
                  isEditing,
                })}
              </>
            ) : (
              <ChatInput
                openEmojis={openEmojis}
                inputRef={inputRef}
                mediaOptionsRef={mediaOptionsRef}
                sendMessage={() =>
                  isEditing ? sendEditedMessage() : sendMessage()
                }
                conversationId={conversationId}
                // chatUserId={chatUserId}
                recipientId={recipientId}
                // selectedMessage={activeQuote}
                value={globalTextMessage}
                setValue={setGlobalTextMessage}
                onStopEditing={() => {
                  setIsEditing(false);
                  clearSelectedMessage();
                }}
                isEditing={isEditing}
              />
            )}
          </View>
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
        chatUserId={client?.userMeta.uid as string}
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
