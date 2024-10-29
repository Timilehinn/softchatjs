import React from 'react';
import {
  ActivityIndicator,
  Button,
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Conversation,
  ConversationListRenderProps,
  ConversationHeaderRenderProps,
  Message,
  UserMeta,
} from "../../types";
import { ConversationItem } from "./Conversation";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  getConversationTitle,
  getUserInfoWithId,
  restructureMessages,
} from "../../utils";
import { useConfig } from "../../contexts/ChatProvider";
import { Events } from "softchatjs-core";
import {
  ChatEventGenerics,
  ConnectionEvent,
  ConversationListMeta,
} from "softchatjs-core";
import { ChatIcon, XIcon } from "../../assets/icons";
import Search from "../Search";
import { StatusBar } from "expo-status-bar";
import { useMessageState } from "../../contexts/MessageStateContext";
import VoiceMessage from "../Chat/ChatItem/Media/VoiceMessage";

type OnOpen = {
  conversation: Conversation;
  unread: string[];
};

type ConversationProps = {
  /**
   * Function to open a Conversation
   * @example: onOpen: () => navigation.navigate('Chat')
   */
  onOpen: (props: OnOpen) => void;

  renderItem?: (props: {
    conversationDetails: ConversationListRenderProps;
  }) => void;
  user: UserMeta;
  renderHeader?: (props: ConversationHeaderRenderProps) => void;
};

export type ConversationsRefs = {
  retryConnection: () => void;
};

const Conversations = forwardRef((props: ConversationProps, ref) => {
  const { onOpen, renderItem, renderHeader, user } = props;
  const { client, theme } = useConfig();
  const { activeVoiceMessage, unload } = useMessageState();
  const [ searchVal, setSearchVal ] = useState("");

  const flatListRef =
    useRef<
      FlatList<{
        conversation: Conversation;
        lastMessage: Message;
        unread: string[];
      }>
    >(null);
  const [conversationList, setConversationList] = useState<
    { conversation: Conversation; lastMessage: Message; unread: string[] }[]
  >([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionEvent>({
    isConnected: false,
    fetchingConversations: false,
    connecting: false,
  });
  const [ userId, setUserId ] = useState('');
  const [ username, setUsername ] = useState('');
  const [ message, setMessage ] = useState('');
  const [ modal, showModal ] = useState(false);

  const reconnect = () => {
    if (client) {
      client.initializeUser(user);
    }
  };

  useImperativeHandle(ref, () => ({
    retryConnection: () => {},
  }));

  const handleConnectionChanged = (
    event: ChatEventGenerics<ConnectionEvent>
  ) => {
    console.log(event, "---events");
    setConnectionStatus(event);
  };

  const handleConversationListChanged = (
    event: ChatEventGenerics<{ conversationListMeta: ConversationListMeta }>
  ) => {
    const values = Object.values(event.conversationListMeta).flat() as {
      conversation: Conversation;
      lastMessage: Message;
      unread: string[];
    }[];
    try {
      values.sort((a, b) => new Date(b.lastMessage?.createdAt).getTime() - new Date(a.lastMessage?.createdAt).getTime())
      setConversationList(values);
    } catch (error) {
      setConversationList(values);
    }
 
  };

  useEffect(() => {
    if(client){
      client.initializeUser(user);
    }
  },[])

  useEffect(() => {
    if (client) {
      client.subscribe(Events.CONNECTION_CHANGED, handleConnectionChanged);
      client.subscribe(
        Events.CONVERSATION_LIST_META_CHANGED,
        handleConversationListChanged
      );
    }

    return () => {
      if (client) {
        client.unsubscribe(Events.CONNECTION_CHANGED, handleConnectionChanged);
        client.unsubscribe(
          Events.CONVERSATION_LIST_META_CHANGED,
          handleConversationListChanged
        );
      }
    };
  }, [client]);

  const renderConversations = useCallback(
    ({
      item,
      index,
    }: {
      item: {
        conversation: Conversation;
        lastMessage: Message;
        unread: string[];
      };
      index: number;
    }) => {
      // sort message from oldest to newes
      // var messages = item?.conversation.messages.sort(
      //   (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      // );

      if (renderItem) {
        let conversationTitle = getConversationTitle(
          user.uid,
          item.conversation
        );
        const userInfo = getUserInfoWithId(
          user.uid,
          item.conversation.participantList
        );

        return (
          <TouchableOpacity
            onPress={() =>
              onOpen({ conversation: item.conversation, unread: item.unread })
            }
          >
            <>
              {renderItem({
                conversationDetails: {
                  title: conversationTitle,
                  recipient: userInfo.presentUser,
                  lastMessage: item.lastMessage,
                },
              })}
            </>
          </TouchableOpacity>
        );
      }

      return (
        <ConversationItem
          onPress={({ conversation, unread }) =>
            onOpen({ conversation, unread: item.unread })
          }
          chatUserId={user.uid}
          key={index}
          conversation={{ ...item.conversation }}
          lastMessage={item.lastMessage}
          unread={item.unread}
          isLastItem={conversationList.length - 1 === index}
        />
      );
    },
    [renderItem, conversationList]
  );


  const startChat = () => {
    if(client){
      if(userId && username && message){
        const msClient = client.newConversation({ uid: userId, username });
        msClient.create(message)
        showModal(false)
      }
    }
  }

  // const filteredConversations = conversationList.filter(c => c.conversation.participantList[0].participantDetails.username.toLowerCase().includes(searchVal.toLowerCase()))

  return (
    <>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <View
        style={{
          flex: 1,
          height: "100%",
          width: "100%",
          backgroundColor: theme?.background.primary,
          paddingHorizontal: 20
        }}
      >
        {renderHeader ? (
          <>
            {renderHeader({
              isConnected: connectionStatus.isConnected,
              isConnecting: connectionStatus.connecting,
            })}
          </>
        ) : (
          <>
            {activeVoiceMessage && (
              <View style={{  borderWidth: 1, padding: 5, borderColor: theme?.divider, borderRadius: 10, marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: "space-between" }}>
                <VoiceMessage media={activeVoiceMessage} textColor="white" />
                <TouchableOpacity onPress={unload} style={{ borderWidth: 1, marginStart: 5, borderColor: theme?.icon, borderRadius: 100, padding: 2, alignItems: 'center', justifyContent: "center" }}>
                  <XIcon color={theme?.icon} size={15} />
                </TouchableOpacity>
              </View>
            )}
            <View
              style={{
                width: "100%",
                height: 40,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View>
                {connectionStatus.connecting ? (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <ActivityIndicator />
                    <Text
                      style={{ marginStart: 5, color: theme?.text.secondary }}
                    >
                      Connecting...
                    </Text>
                  </View>
                ) : (
                  <>
                    {connectionStatus.isConnected ? (
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Text
                          style={{
                            marginStart: 5,
                            color: theme?.text.secondary,
                          }}
                        >
                          Active
                        </Text>
                        <View
                          style={{
                            height: 5,
                            width: 5,
                            backgroundColor: "green",
                            marginStart: 5,
                          }}
                        />
                      </View>
                    ) : (
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Text
                          style={{
                            marginStart: 5,
                            color: theme?.text.secondary,
                          }}
                        >
                          Offline
                        </Text>
                        <View
                          style={{
                            height: 5,
                            width: 5,
                            backgroundColor: "lightgrey",
                            marginStart: 5,
                          }}
                        />
                      </View>
                    )}
                  </>
                )}
              </View>

              {!connectionStatus.isConnected && (
                <TouchableOpacity
                  style={{
                    padding: 5,
                    display: connectionStatus.connecting? 'none' : 'flex',
                    backgroundColor: "green",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={() => reconnect()}
                >
                  <Text style={{ color: "white" }}>Connect</Text>
                </TouchableOpacity>
              )
              //  : (
              //   <TouchableOpacity
              //     style={{
              //       padding: 5,
              //       backgroundColor: "red",
              //       alignItems: "center",
              //       justifyContent: "center",
              //       display: connectionStatus.connecting? 'none' : 'flex',
              //     }}
              //     onPress={() => {}}
              //   >
              //     <Text style={{ color: "white" }}>Disconnect</Text>
              //   </TouchableOpacity>
              // )
              }
            </View>
          </>
        )}

        <FlatList
          ref={flatListRef}
          data={conversationList}
          renderItem={renderConversations}
          ListHeaderComponent={
            <View>
              <Text
                style={{
                  fontSize: 25,
                  color: theme?.text.secondary,
                  fontWeight: "800",
                }}
              >
                Chats
              </Text>
              <Search value={searchVal} setValue={setSearchVal} placeholder="Search chats" containerStyle={{ paddingHorizontal: 0 }} />
            </View>
          }
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 50 }}>
              <ChatIcon size={100} color={theme?.text.disabled} />
              <Text
                style={{
                  marginStart: 5,
                  color: theme?.text.disabled,
                  marginTop: 20,
                }}
              >
                Your conversations will appear here
              </Text>
            </View>
          }
        />
      </View>
      <TouchableOpacity style={{ position: "absolute", bottom: 70, right: 20 }} onPress={() => showModal(true)}>
        <ChatIcon size={70} color={theme?.action.primary} />
      </TouchableOpacity>
      
    </GestureHandlerRootView>
    <Modal visible={modal} animationType="slide">
    <View style={{ height: '100%', width: '100%', padding: 20, backgroundColor: theme?.background.primary, paddingTop: 50 }}>
      <View style={{ alignSelf: 'flex-end' }}>
        <Button title="Close" onPress={() => showModal(false)} />
      </View>
      <View>
          <Text style={{ marginVertical: 10, fontWeight: '600' }}>Username</Text>
          <TextInput 
            value={username}
            onChangeText={val => setUsername(val)}
            style={{ height: 50, width: '100%', borderWidth: 1, borderColor: theme?.divider, borderRadius: 10, color: theme?.text.primary, marginBottom: 10 }}
          />
      </View>

      <View>
        <Text style={{ marginVertical: 10, fontWeight: '600' }}>User ID</Text>
        <TextInput 
          value={userId}
          onChangeText={val => setUserId(val)}
          style={{ height: 50, width: '100%', borderWidth: 1, borderColor: theme?.divider, borderRadius: 10, color: theme?.text.primary, marginBottom: 10 }}
        />
      </View>

      <View>
        <Text style={{ marginVertical: 10, fontWeight: '600' }}>Message</Text>
        <TextInput 
          value={message}
          onChangeText={val => setMessage(val)}
          style={{ height: 50, width: '100%', borderWidth: 1, borderColor: theme?.divider, borderRadius: 10, color: theme?.text.primary, marginBottom: 10 }}
        />
      </View>
     

      <TouchableOpacity onPress={() => startChat()} style={{ marginTop: 50, backgroundColor: theme?.action.primary, borderRadius: 10, padding: 10, height: 50, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 20 }}>Start chat</Text>
      </TouchableOpacity>
    </View>
  </Modal>
    </>
  );
});

export default Conversations;
