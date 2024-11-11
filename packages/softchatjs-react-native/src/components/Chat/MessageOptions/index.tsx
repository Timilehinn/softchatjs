import React from 'react'
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import BottomSheet, { BottomSheetRef } from "../../BottomSheet";
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef
} from "react";
import TrashIcon, {
  CopyIcon,
  EditIcon,
  EmojiIcon,
  ReplyIcon,
} from "../../../assets/icons";
import { ChatTheme } from "../../../types";
import { Message, Emoji } from "softchatjs-core"
import Search from "../../Search";
import { FlashList } from "@shopify/flash-list";
import { emojis } from "../../../assets/emoji";
import { useConfig } from "../../../contexts/ChatProvider";
import ActionSheet, { ActionSheetRef } from "react-native-actions-sheet";


type MessageOptionsProps = {
  recipientId: string;
  message: Message | null;
  isMessageOwner: boolean;
  onReply: () => void;
  onStartEditing: () => void;
  theme: ChatTheme | undefined;
};

var defaultSheetHeight = "55%";

export const MessageOptions = forwardRef(
  (props: MessageOptionsProps, ref: any) => {
    const optionsRef = useRef<ActionSheetRef>(null);
    // const optionsRef = useRef<BottomSheetRef>();
    const { client, fontFamily } = useConfig();
    const {
      recipientId,
      message,
      isMessageOwner,
      onReply,
      onStartEditing,
      theme,
    } = props;
    const flatListRef = useRef(null);
    const [height, setHeight] = useState(defaultSheetHeight);
    const [view, changeView] = useState<"preview" | "emojis">("preview");
    const [searchValue, setSearchValue] = useState("");

    const width = Dimensions.get("window").width;
    const emojiSize = 40;
    var noOfColumns = Math.floor(width / emojiSize);

    const close = () => {
      setHeight(defaultSheetHeight);
      optionsRef?.current?.hide();
      changeView("preview");
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
            style: "cancel"
          },
          {
            text: "Proceed",
            onPress: () => deleteMessage(),
            style: "destructive"
          }
        ],
        { cancelable: false }
      );
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
          onPress: () => {},
        },
        {
          label: "Delete",
          icon: <TrashIcon size={20} color={"red"} />,
          isVisible: isMessageOwner,
          onPress: () => showAlert(),
        },
      ];
    }, [isMessageOwner, view, onReply, onStartEditing]);

    const showAllEmojis = () => {
      setHeight("80%");
      changeView("emojis");
    };


    const addReaction = useCallback(
      (emoji: string) => {
        if (client && message) {
          const newReaction = {
            emoji: emoji,
            uid: client.chatUserId,
          };
          console.log(newReaction, '--newReaction')

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
          {emojis.slice(0, 5).map((emoji, i) => (
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
                  fontSize: Platform.OS === "ios" ? emojiSize : emojiSize - 5,
                  fontFamily
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
            <Text style={{ fontSize: Platform.OS === "android" ? 25 : 35, fontFamily }}>
              {item.emoji}
            </Text>
          </TouchableOpacity>
        );
      },
      [message]
    );

    return (
      // <BottomSheet
      //   ref={optionsRef}
      //   onClose={close}
      //   scrollRef={flatListRef}
      //   height={height}
      // >
    <ActionSheet ref={optionsRef} onClose={close} gestureEnabled snapPoints={[70, 100]} containerStyle={{ height: '70%', padding: 0 }}>
          {view === "preview" && (
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
                {options.map((option, i) => (
                  <TouchableOpacity
                    onPress={() => option.onPress()}
                    key={i}
                    style={[
                      {
                        height: 60,
                        display: option.isVisible ? "flex" : "none",
                        flexDirection: "row",
                        alignItems: "center",
                      },
                      i + 1 !== options.length && {
                        borderBottomWidth: 1,
                        borderBottomColor: theme?.divider,
                      },
                    ]}
                  >
                    {option.icon}
                    <Text
                      style={{
                        marginStart: 15,
                        fontFamily,
                        fontSize: 17,
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
          )}
          {view === "emojis" && (
            <View
              style={{
                // flex: 1,
                height: "100%",
                width: "100%",
                paddingTop: 5,
                padding: 15,
                flexDirection: "row",
                flexWrap: "wrap",
                // flexGrow: 1,
              }}
            >
              <Search
                value={searchValue}
                setValue={setSearchValue}
                placeholder="Find a reaction"
              />
              <View style={{ height: "100%", width: "100%" }}>
                <FlashList
                  ref={flatListRef}
                  numColumns={noOfColumns}
                  data={emoji_list}
                  estimatedItemSize={8000}
                  renderItem={renderEmoji}
                  ListFooterComponent={() => <View style={{ height: 100 }} />}
                />
              </View>
            </View>
          )}
      {/* </BottomSheet> */}
      </ActionSheet>
    );
  }
);

export default MessageOptions;
