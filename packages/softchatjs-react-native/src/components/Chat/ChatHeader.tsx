import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Colors } from "../../constants/Colors";
import { ConversationAvatar } from "../Conversations/ConversationAvatar";
import { ChatHeaderRenderProps, Conversation } from "../../types";
import { getConversationTitle, getUserInfoWithId } from "../../utils";
import { ConversationTitle } from "../Conversations/ConversationList";
import { useMemo } from "react";
import { useConfig } from "../../contexts/ChatProvider";
import { StatusBar } from "expo-status-bar";
import { UserMeta } from "../../../../softchatjs-core/dist/types";
import MessageAvatar from "./MessageAvatar";

type ChatHeaderProps = {
  conversation: Conversation | null;
  chatUserId: string;
  isTyping: boolean;
  // participant: UserMeta;
  renderChatHeader?: (props: ChatHeaderRenderProps) => void;
};

export default function ChatHeader(props: ChatHeaderProps) {
  const { conversation, chatUserId, renderChatHeader, isTyping } =
    props;

  const { theme, fontFamily } = useConfig();

  let conversationTitle = useMemo(() => {
    return conversation ? getConversationTitle(chatUserId, conversation) : null;
  }, [chatUserId, conversation]);

  if (renderChatHeader !== undefined) {
    if (!conversation) return <></>;

    const userInfo = getUserInfoWithId(
      chatUserId,
      conversation.participantList
    );

    return (
      <>
        {renderChatHeader({
          conversationTitle,
          conversationType: conversation.conversationType,
          activeUser: userInfo?.presentUser,
          groupMeta: conversation?.groupMeta,
        })}
      </>
    );
  }

  return (
    <View style={{ ...styles.main, borderBottomColor: theme?.divider }}>
      <StatusBar style="auto" />
      {conversation !== null && (
        
        <ConversationAvatar
          chatUserId={chatUserId}
          participantList={conversation.participantList}
          type={conversation.conversationType}
          groupMeta={conversation.groupMeta}
          conversationTitle={conversationTitle || ""}
        />
        // <MessageAvatar initials={conversationTitle.substring(0,1)} size={60} />
      )}
      <View>
        {conversationTitle && (
          <Text
            style={{
              ...styles.conversationTitle,
              color: theme?.text.secondary,
              fontFamily,
            }}
          >
            {conversationTitle}
          </Text>
        )}
        {isTyping && (
          <Text
            style={{
              ...styles.typingIndicator,
              color: theme?.text.secondary,
              fontFamily,
            }}
          >
            Typing...
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    paddingHorizontal: 15,
    alignItems: "center",
    flexDirection: "row",
    width: "100%",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  conversationTitle: {
    fontSize: 20,
    textTransform: "capitalize",
  },
  typingIndicator: {
    fontSize: 15,
    fontStyle: "italic",
  },
});
