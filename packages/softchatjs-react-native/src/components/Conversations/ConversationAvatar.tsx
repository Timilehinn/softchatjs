import {
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
  FlatList,
} from "react-native";
import {
  Conversation,
  ConversationType,
  GroupChatMeta,
  ParticipantListInfo,
  PrivateChatMeta,
} from "softchatjs-core";
import React, { useMemo, useRef } from "react";
import {
  getUserInfoWithId,
} from "../../utils";
import { Colors } from "../../constants/Colors";
import { Image } from "expo-image";
import { useConfig } from "../../contexts/ChatProvider";

const avatarSize = 50;

export const ConversationAvatar = ({
  type,
  chatUserId,
  participantList,
  groupMeta,
  conversationTitle,
}: {
  conversationTitle: string | undefined;
  chatUserId: string;
  type: ConversationType;
  participantList: ParticipantListInfo[];
  groupMeta: GroupChatMeta | null;
}) => {
  const { fontFamily } = useConfig()
  const userInfo = useMemo(() => {
    if (type === "private-chat") {
      return getUserInfoWithId(chatUserId, participantList);
    }
    return null;
  }, [chatUserId, participantList, type]);

  const imageUri = type === "private-chat"
    ? userInfo?.receivingUser?.profileUrl
    : groupMeta?.groupIcon;
  
  const initials = conversationTitle ? conversationTitle.substring(0, 1) : "";
  
  return (
    imageUri ? (
      <Image source={{ uri: imageUri }} style={styles.avatar} cachePolicy="disk" />
    ) : (
      <View style={styles.avatar}>
        <Text style={{ ...styles.avatarInitials, fontFamily }}>{initials}</Text>
      </View>
    )
  );
};

const styles = StyleSheet.create({
  main: {
    height: "100%",
    width: "100%",
  },
  conversationTitle: {
    color: "black",
    fontSize: 20,
    textTransform: "capitalize",
  },
  messageText: {
    color: "black",
    fontSize: 17,
  },
  messageTime: {},
  avatar: {
    height: avatarSize,
    width: avatarSize,
    borderRadius: avatarSize,
    backgroundColor: Colors.greyLighter,
    alignItems: "center",
    justifyContent: "center",
    marginEnd: 10,
  },
  avatarInitials: {
    fontSize: 30,
    textTransform: "capitalize",
    color: "white",
  },
  listItem: {
    height: 80,
    width: "100%",
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
