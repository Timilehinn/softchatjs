import { createRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  TextInput,
  ScrollView,
  Text,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Conversation, Message, MessageStates } from "../../types";
import { useConnection } from "../../contexts/ConnectionProvider";
import { ChatItem } from "./ChatItem";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ChatInput from "./ChatInput";
import ChatHeader from "./ChatHeader";
import SelectedMessage from "./SelectedMessage";
import EmojiSheet, { EmojiBottomSheet } from "./EmojiSheet";
import MediaOptions from "./MediaOptions";
import {
  generateConversationId,
  generateFillerTimestamps,
  generateId,
  getQuotedMessage,
  getUnreadMessageIds,
} from "../../utils";
import { FlatList } from "react-native-gesture-handler";
import { Screens, useChatClient } from "../../contexts/ChatClientContext";
import MessageOptions from "./MessageOptions";
import Haptics from "../../helpers/haptics";

type ChatProps = {
  conversationId: string;
  chatUserId: string;
  unread: string[];
};

export type SendMessage = {
  message: string;
};

export type SelectedMessage = {
  message: Message | null;
  ref: React.MutableRefObject<View | undefined> | null;
  itemIndex: number;
  isMessageOwner: boolean;
};

export default function Chat(props: ChatProps) {
  const { conversationId, chatUserId, unread } = props;
  const scrollRef = useRef<FlatList<Message>>(null);
  const inputRef = useRef<TextInput>(null);
  const emojiListRef = useRef(null);
  const mediaOptionsRef = useRef(null);
  const messageOptionsRef = useRef(null);
  const { conversation, socket, userMeta } = useConnection();
  const {
    messageBody,
    setTextMessage,
    createMessage,
    setScreen,
    sendReadNotification,
    clearUserUnreadNotifications,
    globalTextMessage
  } = useChatClient();
  const { conversations, setConversations } = conversation;
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  // Message selected via long press
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
  const [recipientId, setRecipientId] = useState("");
  const [pendingMessages, setPendingMessages] = useState<Array<Message>>([]);

  useEffect(() => {
    console.log('re-rendering')
  },[])

  useEffect(() => {
    setScreen(Screens.CHAT);
    console.log("screen set");

    return () => {
      setScreen(Screens.CONVERSATIONS);
      console.log("screen unset");
    };
  }, []);

  const clearSelectedMessage = () =>
    setActiveQuote({ message: null, ref: null, itemIndex: 0 });

  const messageList = useMemo(() => {
    const currentConversation = conversations.find(
      ({ conversationId: id }) => id === conversationId
    );
    var data = currentConversation?.messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return data ? data : [];
  }, [conversations, conversationId]);

  useEffect(() => {
    if (conversationId) {
      const _currentConversation = conversations.find(
        (conversation) => conversation.conversationId === conversationId
      );
      if (_currentConversation) {
        /**
         * @todo get sender and recipient ids from DB
         */
        const recipients = _currentConversation?.participants.filter(
          (id) => id !== chatUserId
        );
        setCurrentConversation(_currentConversation);
        setRecipientId(recipients[0]);
        setMessages(_currentConversation.messages);
      }
    }
  }, [conversationId]);

 
  const openEmojis = () => {
    emojiListRef?.current.open();
    inputRef?.current?.blur();
  };

 

  const sendMessage = async () => {
    try {
      const conversationId = generateConversationId(chatUserId, recipientId);
      const messageId = generateId();
      const quotedMessage = getQuotedMessage(
        activeQuote?.message?.messageId || "",
        messageList
      );
      const newMessage: Message = {
        conversationId,
        from: chatUserId as string,
        to: recipientId,
        message: globalTextMessage,
        messageState: MessageStates.LOADING,
        quotedMessageId: activeQuote?.message?.messageId || "",
        quotedMessage: quotedMessage,
        messageId,
        reactions: [],
        attachedMedia: messageBody.attachedMedia,
        attachmentType: messageBody.attachmentType,
        createdAt: new Date(),
        updatedAt: new Date(),
        messageOwner: {
          uid: chatUserId,
          connectionId: "--",
          projectId: "--",
          meta: userMeta,
          ...generateFillerTimestamps(),
        },
      };
      createMessage(newMessage);
      setTextMessage("");
      console.log("sending -2");
      if (activeQuote.message) {
        clearSelectedMessage();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const onChatItemLongPress = (
    selectedMessage: Message,
    ref: React.MutableRefObject<View | undefined>,
    isMessageOwner: boolean
  ) => {
    const messageIndex = messageList.indexOf(selectedMessage);
    setSelectedMessage({
      message: selectedMessage,
      ref: ref,
      itemIndex: messageIndex,
      isMessageOwner,
    });
    messageOptionsRef?.current?.open();
    Haptics.medium();
  };

  useEffect(() => {
    if (currentConversation) {
      const unread = getUnreadMessageIds(currentConversation, chatUserId);
      if (unread.length > 0) {
        clearUserUnreadNotifications(
          currentConversation.conversationId,
          unread
        );
        sendReadNotification({
          uid: recipientId,
          messageIds: unread,
        });
      }
    }
  }, [currentConversation]);

  const renderChatItem = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      return (
        <ChatItem
          onLongPress={({ message, chatItemRef, isMessageOwner }) =>
            onChatItemLongPress(message, chatItemRef, isMessageOwner)
          }
          inputRef={inputRef}
          position={chatUserId === item.from ? "right" : "left"}
          message={item}
          onSelectedMessage={({ message, chatItemRef }) =>
            setActiveQuote({ message, ref: chatItemRef, itemIndex: index })
          }
          conversation={currentConversation}
          chatUserId={chatUserId}
          recipientId={recipientId}
        />
      );
    },
    [currentConversation]
  );

  const renderMessageOptions = useCallback(() => {
    return (
      <MessageOptions
        optionsRef={messageOptionsRef}
        recipientId={recipientId}
        message={selectedMessage.message}
        isMessageOwner={selectedMessage.isMessageOwner}
        onReply={() => {
          messageOptionsRef?.current?.close();
          setActiveQuote(selectedMessage);
          inputRef.current?.focus();
        }}
      />
    );
  }, [
    selectedMessage,
    recipientId,
    messageOptionsRef,
    inputRef,
    messageOptionsRef,
  ]);

  // useEffect(() => {
  //   scrollRef.current?.scrollToEnd();
  // }, []);


  return (
    <GestureHandlerRootView style={styles.main}>
      <ChatHeader conversation={currentConversation} chatUserId={chatUserId} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <View
          style={{
            flex: 1,
          }}
        >
          <FlatList
            ref={scrollRef}
            inverted
            // onContentSizeChange={() => scrollRef.current?.scrollToEnd()}
            data={messageList.slice(0, 3)}
            keyExtractor={(_, index) => index.toString()}
            ListFooterComponent={() => (
              <View
                style={{
                  height: 30,
                }}
              />
            )}
            style={{
              height: "90%",
            }}
            contentContainerStyle={{
              paddingTop: 10,
            }}
            renderItem={renderChatItem}
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
          <ChatInput
            openEmojis={openEmojis}
            inputRef={inputRef}
            mediaOptionsRef={mediaOptionsRef}
            sendMessage={() => sendMessage()}
            chatUserId={chatUserId}
            recipientId={recipientId}
            selectedMessage={activeQuote}
          />
        </View>
      </KeyboardAvoidingView>
      {/* <EmojiBottomSheet emojiListRef={emojiListRef}  /> */}
      <EmojiSheet
        emojiListRef={emojiListRef}
        openKeyboard={() => inputRef?.current?.focus()}
        sendSticker={sendMessage}
        recipientId={recipientId}
      />
      <MediaOptions emojiListRef={mediaOptionsRef} recipientId={recipientId} />
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
