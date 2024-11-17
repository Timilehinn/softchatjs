import React from "react";
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Platform,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import BottomSheet, { BottomSheetRef } from "../../BottomSheet";
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
import { emojis } from "../../../assets/emoji";
import { useConfig } from "../../../contexts/ChatProvider";
import ActionSheet, { ActionSheetRef } from "react-native-actions-sheet";
import { FlashList } from "react-native-actions-sheet/dist/src/views/FlashList";

type EmojiListProps = {
  recipientId: string;
  message: Message | null;
  theme: ChatTheme | undefined;
};

var windowHeight = Dimensions.get("window").height;

export const EmojiList = forwardRef(
  (props: EmojiListProps, ref: any) => {
    const emojiRef = useRef<ActionSheetRef>(null);
    const { client, fontFamily } = useConfig();
    const {
      recipientId,
      message,
      theme,
    } = props;
    const flatListRef = useRef(null);
    const [searchValue, setSearchValue] = useState("");

    const width = Dimensions.get("window").width;
    const emojiSize = 40;
    var noOfColumns = Math.floor(width / emojiSize);

    const close = () => {
      emojiRef?.current?.hide();
    };

    const open = () => {
      emojiRef?.current?.show();
    };

    useImperativeHandle(ref, () => ({
      open: () => open(),
      close: () => close(),
    }));

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

          emojiRef?.current?.hide();
        } else {
          console.log("not sending");
        }
      },
      [message, client, recipientId]
    );

    var filtered_emojis = emojis.filter((data: Emoji) => {
      return (
        data.description.toLowerCase()?.indexOf(searchValue.toLowerCase()) !==
        -1
      );
    });

    const emoji_list = filtered_emojis.length > 0 ? filtered_emojis : emojis;

    const renderEmoji = useCallback(
      ({ item, index }: { item: any; index: number }) => {
        return (
          <TouchableOpacity
            key={index}
            onPress={() => {
              addReaction(item.emoji);
            }}
            style={{
              height: emojiSize,
              minWidth: emojiSize,
              alignItems: "center",
              margin: 0.7,
              flex: 1,
              justifyContent: "center",
              borderRadius: emojiSize,
            }}
          >
            <Text
              style={{
                fontSize: Platform.OS === "android" ? 25 : 35,
                fontFamily,
              }}
            >
              {item.emoji}
            </Text>
          </TouchableOpacity>
        );
      },
      [message]
    );

    return (
      <ActionSheet
        ref={emojiRef}
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
          height: windowHeight - (30 / 100) * windowHeight,
          padding: 0,
        }}
      >
        {/* <KeyboardAvoidingView behavior="position" style={{ flex: 1, height: '100%', backgroundColor: theme.background.primary }}> */}
          <View
            style={{
              flex: 1,
              minHeight: windowHeight - (30 / 100) * windowHeight,
              width: "100%",
            }}
          >
            <Search
              value={searchValue}
              setValue={setSearchValue}
              placeholder="Find a reaction"
            />
            <View
              style={{
                height: "100%",
                width: "100%",
                paddingTop: 5,
                padding: 15,
                flexDirection: "row",
                flexWrap: "wrap",
                flexGrow: 1,
                flex: 1,
              }}
            >
              <FlashList
                ref={flatListRef}
                numColumns={noOfColumns}
                data={emoji_list}
                estimatedItemSize={8000}
                renderItem={renderEmoji}
                ListEmptyComponent={() => <Text>emepty</Text>}
              />
            </View>
          </View>
        {/* </KeyboardAvoidingView> */}
      </ActionSheet>
    );
  }
);

export default EmojiList;
