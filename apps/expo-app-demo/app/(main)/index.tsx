import { StyleSheet, Platform, TouchableOpacity, Text, View } from 'react-native';

import { Conversations } from "softchatjs-react-native";
import { useNavigation, router } from 'expo-router';
import { useRef } from 'react';
import { ConversationsRefs } from "softchatjs-react-native/src/components/Conversations";

export default function TabOneScreen() {
  

  const navigation = useNavigation();
  const conversationRef = useRef<ConversationsRefs>();
  
  const chatUser = Platform.OS === 'android'? { uid: '100', username: 'mike', color: "green" } : { uid: '30', username: 'timi', color: "blue", profileUrl: "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae" }

  return (
    <View style={styles.container}>
      <Conversations  
        ref={conversationRef}
        user={chatUser}
        onOpen={({ 
          conversation, unread
        }) => {
          router.navigate({
            pathname: '/(main)/two',
            params: { 
              chatUser: JSON.stringify(chatUser),
              conversation: JSON.stringify(conversation),
              conversationId: conversation.conversationId, 
              unread: JSON.stringify(unread)
            }
          });
        }}
        // renderHeader={(props) => <View style={{ height: 60, width: '100%', backgroundColor: 'red' }}>
        //   <Text>{props.isConnecting? 'Connecting' : 'Connected'}</Text>
        // </View>}
        // renderItem={(data) => (
        //   <View style={{ height: 60, width: '100%', flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        //     <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        //       <View style={{ height: 60, width: 60, borderRadius: 60, backgroundColor: 'lightblue', marginEnd: 5 }}></View>
        //       <Text>{data.conversationDetails.title}</Text>
        //     </View>
        //     <Text>{data.conversationDetails.lastMessage?.message}</Text>
        //   </View>
        // )}
      />

      {/* <TouchableOpacity style={{ padding: 15, backgroundColor: 'red' }} onPress={() => conversationRef.current?.retryConnection()}>
        <Text>Retry</Text>
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
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