import { TouchableOpacity, View, StyleSheet, Text, Image } from "react-native";
import { Conversation, Message } from "softchatjs-core";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  formatConversationTime,
  getConversationTitle,
  getParticipant,
  getUnreadMessageIds,
  truncate,
} from "../../utils";
import { Colors } from "../../constants/Colors";
import { ConversationAvatar } from "./ConversationAvatar";
import { UnreadMessagesBadge } from "../Badge";
import { stone } from "../../theme/colors";
import { useConfig } from "../../contexts/ChatProvider";
import Draggeble from "../Draggable";

export type ConversationItemProps = {
  conversation: Conversation;
  chatUserId: string;
  isLastItem: boolean;
  onPress: () => void;
  lastMessage: Message;
  unread: string[];
};

export const ConversationItem = (props: ConversationItemProps) => {
  const { theme, fontFamily } = useConfig();
  const { conversation, chatUserId, isLastItem, onPress, lastMessage, unread } =
    props;

  let conversationTitle = useMemo(() => {
    return getConversationTitle(chatUserId, conversation);
  }, [chatUserId, conversation]);

  let getUnreadMessages = useMemo(() => {
    return getUnreadMessageIds(conversation, chatUserId);
  }, [conversation]);

  const renderLastMessage = useCallback(() => {
    if(!lastMessage){
      return null
    }
    if (
      lastMessage.reactions.length > 0 &&
      chatUserId !== lastMessage?.reactions[lastMessage.reactions.length - 1].uid
    ) {

      return (
        <Text style={{ ...styles.messageText, color: theme?.text.secondary, fontFamily }}>
          <Text style={{ fontStyle: "italic" }}>
            @
            {
              getParticipant(
                lastMessage.reactions[lastMessage.reactions.length - 1]?.uid,
                conversation.participantList
              )?.participantDetails.username
            }
          </Text>{" "}
          reacted "{lastMessage.reactions[0]?.emoji}" to your message.
        </Text>
      );
    }
    if (lastMessage.message) {
      return (
        <Text style={{ ...styles.messageText, color: theme?.text.secondary, fontFamily }}>
          {lastMessage.from === chatUserId ? "You: " : ""}
          {truncate(lastMessage.message, 35)}
        </Text>
      );
    } else {
      return (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ ...styles.messageText, color: theme?.text.secondary, fontFamily }}>
            {lastMessage.from === chatUserId ? "You: " : ""}
          </Text>
          <View style={{ padding: 3, borderWidth: 1, borderColor: theme?.divider, borderRadius: 3 }}>
            <Text
              style={{
                ...styles.messageText,
                fontFamily,
                fontSize: 10,
                color: theme?.text.secondary
              }}
            >
              {lastMessage.attachmentType || "media"}
            </Text>
          </View>
        </View>
      );
    }
  }, [lastMessage]);

  return (
    // <Draggeble actionContainer={
    //   <View style={{ flex: 1, backgroundColor: 'red', width: '100%', height: '100%' }}>
    //     <Text>hello</Text>
    //   </View>
    // }>
    <TouchableOpacity
      style={styles.listItemContainer}
      onPress={() => onPress()}
    >
      <ConversationAvatar
        chatUserId={chatUserId}
        participantList={conversation.participantList}
        type={conversation.conversationType}
        groupMeta={conversation.groupMeta}
        conversationTitle={conversationTitle}
      />
      <View
        style={[
          {
            ...styles.listItem,
          },
          !isLastItem && {
            borderBottomWidth: 0.5,
            borderBottomColor: theme?.divider,
          },
        ]}
      >
        <View
          style={{ flexDirection: "row", flex: 1, alignItems: "center" }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                ...styles.conversationTitle,
                color: theme?.text.secondary,
                fontFamily
              }}
            >
              {conversationTitle}
            </Text>
            <>{renderLastMessage()}</>
          </View>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          {unread.length > 0 && <UnreadMessagesBadge label={unread.length} />}
          {lastMessage && (
            <Text
              style={{
                ...styles.messageTime,
                color: theme?.text.secondary,
                fontFamily
              }}
            >
              {formatConversationTime(lastMessage?.createdAt)}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
    // </Draggeble>

  );
};

const styles = StyleSheet.create({
  main: {
    height: "100%",
    width: "100%",
  },
  conversationTitle: {
    fontSize: 20,
    textTransform: "capitalize",
  },
  messageText: {
    fontSize: 15.5,
  },
  messageTime: {},
  avatarInitials: {
    fontSize: 30,
    textTransform: "capitalize",
    color: "white",
  },
  listItemContainer: {
    flexDirection: "row",
    height: 80,
    flex: 1,
    alignItems: "center",
  },
  listItem: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "space-between",
  },
  typing: {
    fontStyle: "italic",
    color: "green",
  },
});
