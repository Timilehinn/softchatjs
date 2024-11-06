import React from 'react'
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text
} from 'react-native'
import { Colors } from '../../constants/Colors'
import { ConversationAvatar } from '../Conversations/ConversationAvatar'
import { ChatHeaderRenderProps, Conversation } from '../../types'
import { getConversationTitle, getUserInfoWithId } from '../../utils'
import { ConversationTitle } from '../Conversations/ConversationList'
import { useMemo } from 'react'
import { useConfig } from '../../contexts/ChatProvider'
import { StatusBar } from 'expo-status-bar'

type ChatHeaderProps = {
  conversation: Conversation | null,
  chatUserId: string,
  isTyping: boolean,
  renderChatHeader?: (props: ChatHeaderRenderProps) => void; 
}

export default function ChatHeader(props: ChatHeaderProps) {
  const {
    conversation,
    chatUserId,
    renderChatHeader,
    isTyping
  } = props;

  const { theme } = useConfig()

  let conversationTitle = useMemo(() => {
    return conversation ? getConversationTitle(chatUserId, conversation) : null;
  }, [chatUserId, conversation]);
  
  if (renderChatHeader !== undefined) {
    if (!conversation) return <></>;
  
    const userInfo = getUserInfoWithId(chatUserId, conversation.participantList);
  
    return (
      <>
        {renderChatHeader({
          conversationTitle,
          conversationType: conversation.conversationType,
          activeUser: userInfo?.presentUser,
          groupMeta: conversation?.groupMeta
        })}
      </>
    );
  }

  return (
    <View style={{ ...styles.main,
      borderBottomColor: theme?.divider
    }}>
      <StatusBar style="auto" />
      {conversation !== null && (
        <ConversationAvatar
          chatUserId={chatUserId}
          participantList={conversation.participantList}
          type={conversation.conversationType}
          groupMeta={conversation.groupMeta}
          conversationTitle={conversationTitle || ''}
        />
      )}
      <View>
        {conversationTitle && (
          <Text style={{ ...styles.conversationTitle,
    color: theme?.text.secondary,
          }}>{conversationTitle}</Text>
        )}
        {isTyping && (
          <Text style={{ 
            ...styles.typingIndicator,
            color: theme?.text.secondary,
          }}>Typing...</Text>
        )}
      </View>
      
    </View>
  )
}

const styles = StyleSheet.create({
  main: {
    paddingHorizontal: 15,
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 10,
    borderBottomWidth: 1,
    paddingTop: 50
  },
  conversationTitle: {
    fontWeight: '800',
    fontSize: 20,
    textTransform: 'capitalize'
  },
  typingIndicator: {
    fontSize: 15,
    fontStyle: 'italic'
  },
})