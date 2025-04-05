import React from "react";
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ToastAndroid,
} from "react-native";
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import TrashIcon, {
  CopyIcon,
  EditIcon,
  EmojiIcon,
  ReplyIcon,
} from "../../../assets/icons";
import { ChatTheme } from "../../../types";
import { Message, Emoji } from "softchatjs-core";
import Search from "../../Search";
// import { FlashList } from "@shopify/flash-list";
import { useConfig } from "../../../contexts/ChatProvider";
import ActionSheet, { ActionSheetRef } from "react-native-actions-sheet";
import { FlashList } from "react-native-actions-sheet/dist/src/views/FlashList";
import * as Clipboard from 'expo-clipboard';

type MessageOptionsProps = {
  recipientId: string;
  message: Message | null;
  isMessageOwner: boolean;
  onReply: () => void;
  onStartEditing: () => void;
  theme: ChatTheme | undefined;
  openEmojiList: () => void;
};

var defaultSheetHeight = "55%";
var windowHeight = Dimensions.get("window").height;
var emojis = [
  {
    emoji: "😀",
    description: "grinning face",
    category: "Smileys & Emotion",
    aliases: ["grinning"],
    tags: ["smile", "happy"],
    unicode_version: "6.1",
    ios_version: "6.0",
  },
  {
    emoji: "😃",
    description: "grinning face with big eyes",
    category: "Smileys & Emotion",
    aliases: ["smiley"],
    tags: ["happy", "joy", "haha"],
    unicode_version: "6.0",
    ios_version: "6.0",
  },
  {
    emoji: "😄",
    description: "grinning face with smiling eyes",
    category: "Smileys & Emotion",
    aliases: ["smile"],
    tags: ["happy", "joy", "laugh", "pleased"],
    unicode_version: "6.0",
    ios_version: "6.0",
  },
  {
    emoji: "😁",
    description: "beaming face with smiling eyes",
    category: "Smileys & Emotion",
    aliases: ["grin"],
    tags: [],
    unicode_version: "6.0",
    ios_version: "6.0",
  },
  {
    emoji: "😆",
    description: "grinning squinting face",
    category: "Smileys & Emotion",
    aliases: ["laughing", "satisfied"],
    tags: ["happy", "haha"],
    unicode_version: "6.0",
    ios_version: "6.0",
  },
]

export const MessageOptions = forwardRef(
  (props: MessageOptionsProps, ref: any) => {
    const optionsRef = useRef<ActionSheetRef>(null);
    const { client, fontFamily, fontScale } = useConfig();
    const {
      recipientId,
      message,
      isMessageOwner,
      onReply,
      onStartEditing,
      theme,
      openEmojiList,
    } = props;
    const flatListRef = useRef(null);
    const [height, setHeight] = useState(defaultSheetHeight);
    const [searchValue, setSearchValue] = useState("");
    const width = Dimensions.get("window").width;
    const emojiSize = 40;
    var noOfColumns = Math.floor(width / emojiSize);

    const close = () => {
      setHeight(defaultSheetHeight);
      optionsRef?.current?.hide();
    };

    const open = () => {
      optionsRef?.current?.show();
    };

    useImperativeHandle(ref, () => ({
      open: () => open(),
      close: () => close(),
    }));

    const deleteMessage = () => {
      if (client && message) {
        client
          .messageClient(message.conversationId)
          .deleteMessage(
            message.messageId,
            recipientId,
            message.conversationId
          );
        // optionsRef?.current?.close();
      }
    };

    const showAlert = () => {
      optionsRef?.current?.hide();
      Alert.alert(
        "Delete message",
        "This action is irreversible. Proceed?",
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancelled"),
            style: "cancel",
          },
          {
            text: "Proceed",
            onPress: () => deleteMessage(),
            style: "destructive",
          },
        ],
        { cancelable: false }
      );
    };

    const copyToClipboard = async (text: string) => {
      await Clipboard.setStringAsync(text);
      if (Platform.OS === "android") {
        ToastAndroid.show("Copied text message", ToastAndroid.SHORT);
      }
      optionsRef.current.hide();
    };

    const options = useMemo(() => {
      return [
        {
          label: "Edit message",
          icon: <EditIcon size={20} color={theme?.icon} />,
          isVisible: isMessageOwner,
          onPress: () => onStartEditing(),
        },
        {
          label: "Reply",
          icon: <ReplyIcon size={20} color={theme?.icon} />,
          isVisible: true,
          onPress: () => onReply(),
        },
        {
          label: "Copy",
          icon: <CopyIcon size={20} color={theme?.icon} />,
          isVisible: true,
          onPress: () => copyToClipboard(message?.message),
        },
        {
          label: "Delete",
          icon: <TrashIcon size={20} color={"red"} />,
          isVisible: isMessageOwner,
          onPress: () => showAlert(),
        },
      ];
    }, [isMessageOwner, onReply, message, onStartEditing]);

    const showAllEmojis = () => {
      optionsRef.current.hide();
      setTimeout(() => {
        openEmojiList();
      },200)
    };

    const addReaction = useCallback(
      (emoji: string) => {
        if (client && message) {
          const newReaction = {
            emoji: emoji,
            uid: client.chatUserId,
          };
          const existingReactionIndex = message.reactions.findIndex(
            (reaction) => reaction.uid === client.chatUserId
          );

          let updatedReactions: Array<{ uid: string; emoji: string }>;

          if (existingReactionIndex !== -1) {
            updatedReactions = [...message.reactions];
            updatedReactions[existingReactionIndex] = newReaction;
          } else {
            updatedReactions = [...message.reactions, newReaction];
          }

          client.messageClient(message.conversationId).reactToMessage({
            conversationId: message.conversationId,
            messageId: message.messageId,
            reactions: updatedReactions,
            to: recipientId,
          });

          optionsRef?.current?.hide();
        } else {
          console.log("not sending");
        }
      },
      [message, client, recipientId]
    );

    const renderStickers = useCallback(() => {
      return (
        <View
          style={[
            {
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              flex: 1,
            },
          ]}
        >
          {emojis.map((emoji, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => addReaction(emoji.emoji)}
              style={{
                alignItems: "center",
                height: 50,
                width: 50,
                margin: 5,
                justifyContent: "center",
                borderRadius: emojiSize,
                backgroundColor: theme?.background.primary,
              }}
            >
              <Text
                style={{
                  fontSize: Platform.OS === "ios" ? emojiSize * fontScale : (emojiSize - 5) * fontScale,
                  fontFamily,
                }}
              >
                {emoji.emoji}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={showAllEmojis}
            style={{
              borderRadius: 100,
              alignItems: "center",
              height: 50,
              width: 50,
              margin: 5,
              justifyContent: "center",
              backgroundColor: theme?.background.secondary,
            }}
          >
            <EmojiIcon size={35} color="grey" />
          </TouchableOpacity>
        </View>
      );
    }, [message]);

    return (
      <ActionSheet
        ref={optionsRef}
        enableGesturesInScrollView
        keyboardHandlerEnabled={false}
        isModal
        openAnimationConfig={{ speed: 700 }}
        onClose={close}
        gestureEnabled
        containerStyle={{
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          backgroundColor: theme.background.primary,
          height: '47%',
          padding: 0,
        }}
      >
        <View
          style={{
            // flex: 1,
            height: "100%",
            width: "100%",
            justifyContent: "flex-start",
            paddingHorizontal: 15,
            paddingTop: 5,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              height: 50,
            }}
          >
            {renderStickers()}
          </View>
          <View
            style={{
              borderRadius: 20,
              paddingHorizontal: 20,
              marginTop: 20,
              backgroundColor: theme?.background.secondary,
            }}
          >
            {options
              .filter((o) => o.isVisible)
              .map((option, i) => (
                <TouchableOpacity
                  onPress={() => option.onPress()}
                  key={i}
                  style={[
                    {
                      height: 60,
                      flexDirection: "row",
                      alignItems: "center",
                    },
                    i !== 0 && {
                      borderTopWidth: 1,
                      borderTopColor: theme?.divider,
                    },
                  ]}
                >
                  {option.icon}
                  <Text
                    style={{
                      marginStart: 15,
                      fontFamily,
                      fontSize: 17 * fontScale,
                      color:
                        option.label === "Delete"
                          ? "red"
                          : theme?.text.secondary,
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>
      </ActionSheet>
    );
  }
);

export default MessageOptions;
