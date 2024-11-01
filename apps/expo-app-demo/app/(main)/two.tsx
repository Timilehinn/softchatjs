import { StyleSheet, View, Text, Platform, TextInput, TouchableOpacity } from 'react-native';
import Chat from 'softchatjs-react-native/src/components/Chat';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import MessageAvatar from 'softchatjs-react-native/src/components/Chat/MessageAvatar';
import { useRef } from 'react';
import { Conversation, Message, UserMeta } from 'softchatjs-react-native/src/types';

export default function TabTwoScreen() {

  var inputRef = useRef(null)
  const item = useLocalSearchParams();
  var chatUser = JSON.parse(item.chatUser as string) as UserMeta;
  var conversationId = item.conversationId as string;
  var unread = JSON.parse(item.unread as string) as string[]
  var conversation = JSON.parse(item.conversation as string) as Conversation

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Chat 
        // layout='stacked'
        chatUser={chatUser}
        conversationId={conversationId} 
        unread={unread} 
        conversation={conversation}
        // renderChatHeader={(props) => (
        //   <View style={{ paddingTop: 50 }}>
        //     <Text>{JSON.stringify(props.activeUser)}</Text>
        //     <Text>{JSON.stringify(props.conversationType)}</Text>
        //     <Text>{JSON.stringify(props.groupMeta)}</Text>
        //   </View>
        // )}
        // renderChatBubble={({ message }) => (
        //   <View style={{ width: '100%', padding: 10, borderWidth: 1, flexDirection: 'row', alignItems: 'center' }}>
        //     <MessageAvatar
        //     initials={message.messageOwner.username?.substring(0,1) as string}
        //     size={40}
        //     />
        //     <View>
        //       <Text style={{ marginStart: 5 }}>{message.messageOwner.username}</Text>
        //       <Text style={{ marginStart: 5 }}>{message.message} {message.lastEdited ? 'EDITED' : ''}</Text>
        //       <Text style={{ marginStart: 5 }}>{message.messageState}</Text>
        //       {message.reactions.map((r, i) => (
        //         <Text key={i}>{r.emoji}</Text>
        //       ))}
        //     </View>
        //   </View>
        // )}
        // renderChatInput={(props) => (
        //   <View style={{ flexDirection: 'row', alignItems: 'center',  }}>
        //     <TouchableOpacity onPress={() => props.openMediaOptions(inputRef)} style={{ padding: 20, backgroundColor: 'red' }}>
        //       <Text>Attatchment</Text>
        //     </TouchableOpacity>
        //     <TextInput ref={inputRef} value={props.value} onChangeText={(value) => props.onValueChange(value)} style={{ height: 60, width: '100%', borderWidth: 1, flex: 1 }} />
        //     <TouchableOpacity onPress={() => props.sendMessage(inputRef)} style={{ padding: 20, backgroundColor: 'red' }}>
        //       <Text>Send</Text>
        //     </TouchableOpacity>
        //   </View>
        // )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "white",
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
