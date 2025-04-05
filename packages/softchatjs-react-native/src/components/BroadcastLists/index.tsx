import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
import ChatClient, { Events, ConversationListMeta, ConversationListItem } from "softchatjs-core";
import { useConfig } from "../../contexts/ChatProvider";
import { ArrowRight } from "../../assets/icons";

type BroadcastListsProps =  { 
  /**
   * ChatClient instance
   */
  client: ChatClient | null, 
  /**Function
   *  to select a broadcastlist item
   */
  onOpen: (item: ConversationListItem) => void; renderPlaceholder?: () => JSX.Element, 
  /**
   * 
   * @param data: ConversationListItem 
   * @param index: number
   * @returns 
   */
  renderItem?: (data: ConversationListItem, index: number) => JSX.Element 
}

export default function BroadcastLists(props: BroadcastListsProps) {
  const { client, onOpen, renderPlaceholder } = props;
  const { fontFamily, theme, fontScale } = useConfig();

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
      const res = client.getBroadcastLists();
      const list = Object.values(res).flat();
      setBroadcastLists(list);
      client.subscribe(
        Events.BROADCAST_LIST_META_CHANGED,
        handleBroadcastListMetaChanged
      );
    return () => {
      client.unsubscribe(
        Events.BROADCAST_LIST_META_CHANGED,
        handleBroadcastListMetaChanged
      );
    };
  }, []);

  const renderBroadcastItem = useCallback(({ item, index }: { item: ConversationListItem, index: number }) => {

    if(props.renderItem){
      return (
        <TouchableOpacity key={index} onPress={() => onOpen(item)}>
          {props.renderItem(item, index)}
        </TouchableOpacity>
      )
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
      onPress={() => onOpen(item)}
    >
      <View>
        <Text style={{ fontSize: 20 * fontScale, fontFamily }}>
          {item.conversation.name}
        </Text>
        <Text>{item.conversation.participants.length} Recipients</Text>
      </View>
      <ArrowRight size={12} color={theme.icon} />
    </TouchableOpacity>
    )
  },[props.renderItem, broadcastLists, fontScale]);

  return (
    <View style={styles.main}>
      <FlatList
        data={broadcastLists}
        renderItem={renderBroadcastItem}
        ListEmptyComponent={
          renderPlaceholder? renderPlaceholder() : null
        }
      />
    </View>
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
