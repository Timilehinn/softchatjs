import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import ChatClient, { Events, ConversationListMeta } from "softchatjs-core";
import { useNavigation, router } from "expo-router";
import { useConfig } from "../../contexts/ChatProvider";
import { ArrowRight } from "../../assets/icons";

export default function BroadcastLists(props: { client: ChatClient | null, renderItem: (data: ConversationListMeta) => JSX.Element }) {
  const { client } = props;
  const { fontFamily, theme } = useConfig();

  const [broadcastLists, setBroadcastLists] = useState([]);

  const createNewBroadcastList = () => {
    const newBroadcastList = client.newBroadcastList([
      {
        username: "skyline_ace",
        uid: "a1b2c3d4e5",
        firstname: "Alex",
        lastname: "Smith",
        profileUrl: "https://avatar.iran.liara.run/public",
        custom: { bio: "Lover of heights", hobby: "Climbing" },
        color: "#3498db",
      },
    ]);
    const res = newBroadcastList.create();
    console.log(res);
    // setBroadcastLists(prev => {
    //   return [ ...prev, res ]
    // })
  };

  useEffect(() => {}, []);

  const handleBroadcastListMetaChanged = (event: any) => {
    const list = Object.values(event.broadcastListMeta).flat();
    setBroadcastLists(list);
  };

  useEffect(() => {
    if (client) {
      const res = client.getBroadcastLists();
      const list = Object.values(res).flat();
      setBroadcastLists(list);
      client.subscribe(
        Events.BROADCAST_LIST_META_CHANGED,
        handleBroadcastListMetaChanged
      );
    }
    return () => {
      client.unsubscribe(
        Events.BROADCAST_LIST_META_CHANGED,
        handleBroadcastListMetaChanged
      );
    };
  }, [client]);

  const chatUser = {
    uid: "30",
    username: "timi",
    color: "blue",
    profileUrl: "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
  };

  const renderBroadcastItem = useCallback(({ item, index }: { item: ConversationListMeta, index: number }) => {

    if(props.renderItem){
      return props.renderItem(item)
    }

    return (
      <TouchableOpacity
      key={index}
      style={[
        {
          ...styles.broadcast_item,
        },
        broadcastLists.length !== index + 1 && {
          borderBottomWidth: 1,
          borderColor: theme.divider,
        },
      ]}
      onPress={() => {
        router.navigate({
          pathname: "/(main)/three",
          params: {
            chatUser: JSON.stringify(chatUser),
            activeConversation: JSON.stringify(item),
          },
        });
      }}
    >
      <View>
        <Text style={{ fontSize: 20, fontFamily }}>
          {item.conversation.name}
        </Text>
        <Text>{item.conversation.participants.length} Recipients</Text>
      </View>
      <ArrowRight size={12} color={theme.icon} />
    </TouchableOpacity>
    )
  },[])

  return (
    <>
      <View style={styles.main}>
        <FlatList
          data={broadcastLists}
          renderItem={renderBroadcastItem}
        />
      </View>
      {/* <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center', height: 20 }}>
      <TouchableOpacity
        onPress={createNewBroadcastList}
        style={{ padding: 20, marginBottom: 30, backgroundColor: "black" }}
      >
        <Text style={{ color: "white" }}>Create broadcast</Text>
      </TouchableOpacity>
      </View> */}
     
    </>
  );
}

const styles = StyleSheet.create({
  main: {
    backgroundColor: "white",
    flex: 1,
    height: "100%",
    width: "100%",
    padding: 20,
  },
  broadcast_item: {
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
