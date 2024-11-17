import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Platform,
} from "react-native";
import React, { useState, useCallback } from "react";
import Search from "../Search";
import { FlashList } from "@shopify/flash-list";
import { emojis } from "../../assets/emoji";
import { useConfig } from "../../contexts/ChatProvider";
import { CloseIcon, TimesIcon } from "../../assets/icons";
import { useModalProvider } from "../../contexts/ModalProvider";
import { Emoji, Message } from "softchatjs-core";
import { ChatTheme } from "../../types";

type EmojiListProps = {
  recipientId: string;
  message: Message | null;
  theme: ChatTheme | undefined;
  type?: "reaction" | "message",
  onSelect?: (value: string) => void;
};

export default function EmojiListModal(props: EmojiListProps) {
  const { recipientId, message, theme, type = "reaction", onSelect } = props;
  const { fontFamily, client } = useConfig();
  const [searchValue, setSearchValue] = useState("");
  const { resetModal } = useModalProvider();

  const width = Dimensions.get("window").width;
  const emojiSize = 50;
  var noOfColumns = Math.floor(width / emojiSize);

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
      } else {
        console.log("not sending");
      }
    },
    [message, client, recipientId]
  );

  const renderEmoji = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      return (
        <TouchableOpacity
          key={index}
          onPress={() => {
            if(type == "reaction"){
              addReaction(item.emoji);
            }else{
              onSelect?.(item.emoji)
            }
            resetModal();
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
              // fontSize: Platform.OS === "android" ? 25 : 35,
              fontSize: emojiSize * 0.75,
              fontFamily,
            }}
          >
            {item.emoji}
          </Text>
        </TouchableOpacity>
      );
    },
    []
  );

  var filtered_emojis = emojis.filter((data: Emoji) => {
    return (
      data.description.toLowerCase()?.indexOf(searchValue.toLowerCase()) !==
      -1
    );
  });

  const emoji_list = filtered_emojis.length > 0 ? filtered_emojis : emojis;

  return (
    <View
      style={{
        backgroundColor: theme.background.primary,
        flex: 1,
        height: "100%",
        width: "100%",
        paddingTop: Platform.OS === "ios"? 40 : 0
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 15,
        }}
      >
        <TouchableOpacity onPress={() => resetModal()}>
          <TimesIcon color={theme.icon} />
        </TouchableOpacity>
        <Search
          containerStyle={{ flex: 1 }}
          value={searchValue}
          setValue={setSearchValue}
          placeholder="Search emoji"
        />
      </View>
      <Text style={{ paddingHorizontal: 15, color: theme.text.secondary }}>
        Smileys and Emoticons
      </Text>

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
          numColumns={noOfColumns}
          data={emoji_list}
          estimatedItemSize={200}
          renderItem={renderEmoji}
          ListEmptyComponent={() => <Text>emepty</Text>}
        />
      </View>
    </View>
  );
}
