import React from 'react';
import { TouchableOpacity, View, StyleSheet, Text, FlatList } from "react-native";
import { Conversation, ConversationType, GroupChatMeta, ParticipantListInfo, PrivateChatMeta } from "../../types";
import { useRef } from "react";
import { formatMessageTime, getConversationTitle, getUserInfoWithId, truncate } from "../../utils";
import { Colors } from "../../constants/Colors";
import { stone } from "../../theme/colors";
import { useConfig } from "../../contexts/ChatProvider";
import { Image } from "expo-image";

type ConversationListProps = {
  conversations: Conversation[],
  chatUserId: string,
  onOpen: () => void;
}

type ListItemProps = {
  conversation: Conversation,
  chatUserId: string,
  isLastItem: boolean,
  onPress: () => void;
}

const avatarSize = 50

const ConversationAvatar = ({ type, chatUserId, participantList, groupMeta, conversationTitle }: { conversationTitle: string | undefined, chatUserId: string, type: ConversationType, participantList: ParticipantListInfo[], groupMeta: GroupChatMeta | null }) => {
  if(type === 'private-chat') {
    const userInfo = getUserInfoWithId(chatUserId, participantList);
    if(userInfo.presentUser?.meta.profileImgUrl){
      return <Image source={{ uri: userInfo.presentUser?.meta.profileImgUrl }} cachePolicy={"disk"} style={styles.avatar} />
    }else{
      return (
        <View style={styles.avatar} >
          <Text style={styles.avatarInitials}>{conversationTitle? conversationTitle.substring(0,1) : ''}</Text>
        </View>
      )
    }
  }else{
    if(groupMeta?.groupIcon) {
      return <Image source={{ uri: groupMeta.groupIcon }} style={styles.avatar} cachePolicy={"disk"} />
    }else{
      return (
        <View style={styles.avatar}>
          <Text>{conversationTitle? conversationTitle.substring(0,1) : ''}</Text>
        </View>
      )
    }
  }
}

export const ConversationTitle = ({ title }: { title: string }) => {

  const { theme } = useConfig();

  return (
    <View>
      <Text style={{ 
        ...styles.conversationTitle,
        color: theme?.text.secondary,
      }}>{title}</Text>
    </View>
  )
}

export const ListItem = (props: ListItemProps) => {

  const { conversation, chatUserId, isLastItem, onPress } = props;
  // const userInfo = getUserInfoWithId(chatUserId, conversation.participantList);

  const lastMessage = conversation.messages[conversation.messages.length - 1];
  
  let conversationTitle = getConversationTitle(chatUserId, conversation)

  return (
    <TouchableOpacity 
    onPress={onPress}
      style={[styles.listItem, !isLastItem && { borderBottomWidth: .5, borderBottomColor: Colors.greyLighter } ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <ConversationAvatar 
          chatUserId={chatUserId}
          participantList={conversation.participantList}
          type={conversation.conversationType}
          groupMeta={conversation.groupMeta}
          conversationTitle={conversationTitle}
        />
        <View style={{ maxWidth: '80%' }}>
          {conversationTitle && (
            <ConversationTitle title={conversationTitle} />
          )}
          <Text style={styles.messageText}>{truncate(lastMessage.message, 45)}</Text>
        </View>
        </View>
      
      <Text style={styles.messageTime}>{formatMessageTime(lastMessage.createdAt)}</Text>
    </TouchableOpacity>
  )
}

export default function ConversationList(props: ConversationListProps) {
  
  const {
    conversations,
    chatUserId,
    onOpen
  } = props;

  const flatListRef = useRef<FlatList<Conversation>>(null);

  return (
    <View style={styles.main}>
      <FlatList 
        ref={flatListRef}
        data={conversations}
        renderItem={({ item, index }) => (
          <ListItem
            onPress={()=>onOpen()}
            chatUserId={chatUserId} 
            key={index}
            conversation={item}
            isLastItem={conversations.length === index + 1}
          />
        )}
      />
    </View>
    
  )
}

const styles = StyleSheet.create({
  main: {
    height: '100%',
    width: '100%'
  },
  conversationTitle: {
    fontWeight: '800',
    fontSize: 20,
    textTransform: 'capitalize'
  },
  messageText: {
    color: 'black',
    fontSize: 17,
  },
  messageTime: {

  },
  avatar: {
    height: avatarSize,
    width: avatarSize,
    borderRadius: avatarSize,
    backgroundColor: Colors.greyLighter,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 10
  },
  avatarInitials: {
    fontWeight: '700',
    fontSize: 30,
    textTransform: 'capitalize',
    color: 'white',
  },
  listItem: {
    height: 80, 
    width: '100%',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: stone[600]
    // backgroundColor: 'lightgrey',
  }
})
