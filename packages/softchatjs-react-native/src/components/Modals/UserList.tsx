import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native'
import React from 'react';
import { useConfig } from "../../contexts/ChatProvider";
import { CameraFlipIcon, XIcon } from '../../assets/icons';
import { UserMeta } from 'softchatjs-core';
import MessageAvatar from '../Chat/MessageAvatar';
import { useModalProvider } from '../../contexts/ModalProvider';

type UserListProps = {
  data: Array<UserMeta>,
  goToChat: () => void;
  title?: string
}

export default function UserList(props: UserListProps) {

  const { data, goToChat, title = "Start conversation"} = props;
  const { theme, client, fontFamily } = useConfig();
  const { resetModal } = useModalProvider();

  const startChat = (data: UserMeta) => {
    if(client){
      const msClient = client.newConversation({ ...data }, null);
      const res = msClient.create("Hey👋");
      resetModal();
      setTimeout(() => {
        goToChat()
      }, 500);
    }
  }

  return (
    <View style={{ ...styles.container, backgroundColor: theme?.background.primary }}>
      <View style={{ ...styles.header }}>
        <Text style={{ color: theme?.text.secondary, fontFamily, fontSize: 25 }}>{title}</Text>
        <TouchableOpacity onPress={() => resetModal()}>
          <XIcon size={25} color={theme?.icon} />
        </TouchableOpacity>
      </View>
      <FlatList 
        data={data}
        style={{ marginTop: 20 }}
        renderItem={({ item, index }) => (
          <TouchableOpacity 
            onPress={() => startChat(item)}
          style={styles.userItem}>
            <MessageAvatar 
              size={50}
              initials={item.username.substring(0, 1)}
              imgUrl={item.profileUrl}
              style={{ marginEnd: 15 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme?.text.secondary, fontSize: 18, fontFamily }}>{item.firstname} {item.lastname}</Text>
              <Text style={{ color: theme?.text.secondary, fontFamily, fontSize: 12 }}>{item.username}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    height: '100%',
    width: '100%',
    padding: 20
  },
  header: {
    // height: 50, 
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios'? 30 : 10,
    justifyContent: 'space-between'
  },
  userItem: {
    height: 70, 
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  }
})