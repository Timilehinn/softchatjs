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
import {
  ChatEventGenerics,
  ConnectionEvent,
  ConversationListMeta,
  Events
} from "softchatjs-core";
import { ChatIcon, ChatIconPlus, XIcon } from "../../assets/icons";
import Search from "../Search";
import { StatusBar } from "expo-status-bar";
import { useMessageState } from "../../contexts/MessageStateContext";
import VoiceMessage from "../Chat/ChatItem/Media/VoiceMessage";
import { useModalProvider } from '../../contexts/ModalProvider';
import UserList from '../../components/Modals/UserList'
import { useNavigation, router } from 'expo-router';


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

const users = [
  {
    username: "skyline_ace",
    uid: "a1b2c3d4e5",
    firstname: "Alex",
    lastname: "Smith",
    profileUrl: "https://avatar.iran.liara.run/public",
    custom: { bio: "Lover of heights", hobby: "Climbing" },
    color: "#3498db",
  },
  {
    username: "tech_guru",
    uid: "f6g7h8i9j0",
    firstname: "Priya",
    profileUrl: "https://avatar.iran.liara.run/public",
    custom: { bio: "Coding expert", location: "San Francisco" },
    color: "#e74c3c",
  },
  {
    username: "wanderlust_joe",
    uid: "k1l2m3n4o5",
    firstname: "Joe",
    lastname: "Wander",
    custom: { favCity: "Tokyo", travelCount: "23" },
    color: "#2ecc71",
  },
  {
    username: "green_thumb",
    uid: "p6q7r8s9t0",
    firstname: "Lily",
    lastname: "Green",
    profileUrl: "https://avatar.iran.liara.run/public",
    custom: { plantCount: "67", "hobby": "Gardening" },
    color: "#27ae60",
  },
  {
    username: "chefmax",
    uid: "u1v2w3x4y5",
    lastname: "Mendez",
    profileUrl: "https://avatar.iran.liara.run/public",
    custom: { specialty: "Italian Cuisine" },
    color: "#f39c12",
  },
  {
    username: "code_maverick",
    uid: "z6a7b8c9d0",
    firstname: "Sara",
    profileUrl: "https://avatar.iran.liara.run/public",
    custom: { bio: "Full-Stack Developer", favoriteLang: "JavaScript" },
    color: "#9b59b6",
  },
  {
    username: "blue_sky_98",
    uid: "e1f2g3h4i5",
    firstname: "Mark",
    lastname: "Sky",
    color: "#2980b9",
  },
  {
    username: "speedster_ella",
    uid: "j6k7l8m9n0",
    firstname: "Ella",
    custom: { passion: "Running", record: "Marathon" },
    color: "#e67e22",
  },
  {
    username: "astro_john",
    uid: "o1p2q3r4s5",
    lastname: "Johnson",
    profileUrl: "https://avatar.iran.liara.run/public",
    custom: { bio: "Space Enthusiast", favPlanet: "Mars" },
    color: "#34495e",
  },
  {
    username: "fitness_fanatic",
    uid: "t6u7v8w9x0",
    firstname: "Nina",
    profileUrl: "https://avatar.iran.liara.run/public",
    custom: { activity: "Yoga", goal: "Well-being" },
    color: "#1abc9c",
  },
];


export type ConversationsRefs = {
  retryConnection: () => void;
};

const Conversations = forwardRef((props: ConversationProps, ref) => {
  const { onOpen, renderItem, renderHeader, user } = props;
  const { client, theme } = useConfig();
  const { activeVoiceMessage, unload } = useMessageState();
  const [ searchVal, setSearchVal ] = useState("");
  const { displayModal } = useModalProvider();

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

  console.log(":::::")
  // console.log(JSON.stringify(conversationList[0].conversation.participantList));

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


  // const startChat = () => {
  //   if(client){
  //     if(userId && username && message){
  //       const msClient = client.newConversation({ uid: userId, username });
  //       msClient.create(message)
  //       showModal(false)
  //     }
  //   }
  // }

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
        {/* <Text style={{ color:'white' }}>{JSON.stringify(conversationList[0].conversation.participantList)}</Text> */}
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
          showsVerticalScrollIndicator={false}
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
      <TouchableOpacity style={{ position: "absolute", bottom: 70, right: 20 }} onPress={() => displayModal({
        children: (
          <UserList 
            data={users as UserMeta[]}
            goToChat={() => {}}
          />
        )
      })}>
        <ChatIconPlus size={70} color={theme?.action.primary} />
      </TouchableOpacity>
      
    </GestureHandlerRootView>
    </>
  );
});

export default Conversations;
