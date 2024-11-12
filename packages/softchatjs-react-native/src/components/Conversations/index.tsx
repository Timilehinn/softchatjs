import React, { useMemo } from "react";
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
  ConversationListRenderProps,
  ConversationHeaderRenderProps,
  Children,
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
  Events,
  Conversation, 
  Message,
  UserMeta,
  ConversationListItem
} from "softchatjs-core";
import { ChatIcon, ChatIconPlus, XIcon } from "../../assets/icons";
import Search from "../Search";
import { StatusBar } from "expo-status-bar";
import { useMessageState } from "../../contexts/MessageStateContext";
import VoiceMessage from "../Chat/ChatItem/Media/VoiceMessage";
import { useModalProvider } from "../../contexts/ModalProvider";
import UserList from "../../components/Modals/UserList";
import {  } from "../../../../softchatjs-core/dist/types";

type ConversationProps = {
  /**
   * Function to open a Conversation
   * @example: onOpen: () => navigation.navigate('Chat')
   */
  onOpen: (props: {
    activeConversation: ConversationListItem
  }) => void;

  renderItem?: (props: {
    conversationDetails: ConversationListRenderProps;
  }) => void;
  user: UserMeta;
  renderHeader?: (props: ConversationHeaderRenderProps) => void;
  renderPlaceHolder?: ({ loading }: { loading: boolean }) => Children;
  users?: UserMeta[];
  store?: ConversationListMeta
};

export type ConversationsRefs = {
  retryConnection: () => void;
};

const retrieveFromCache = (store: ConversationListMeta) => {
  try {
    const values = Object.values(store).flat() as {
      conversation: Conversation;
      lastMessage: Message;
      unread: string[];
    }[];
    values.sort(
      (a, b) =>
        new Date(b.lastMessage?.createdAt).getTime() -
        new Date(a.lastMessage?.createdAt).getTime()
    );
    return values
  } catch (error) {
    return []
  }
}

const Conversations = forwardRef((props: ConversationProps, ref) => {
  const {
    onOpen,
    renderItem,
    renderHeader,
    user,
    renderPlaceHolder,
    users = [],
    store = {},
  } = props;
  
  const { client, theme, fontFamily } = useConfig();
  const { activeVoiceMessage, unload, setUserMeta } = useMessageState();
  const [searchVal, setSearchVal] = useState("");
  const { displayModal } = useModalProvider();

  const flatListRef = useRef<
    FlatList<{
      conversation: Conversation;
      lastMessage: Message;
      unread: string[];
    }>
  >(null);
  
  const [conversationList, setConversationList] = useState<{ conversation: Conversation; lastMessage: Message; unread: string[] }[]>([ ...retrieveFromCache(store) ]);

  // useEffect(() =>{
  //   if(store){
  //     var cList = retrieveFromCache(store);
  //     setConversationList(cList)
  //   }
  // },[store])

  const [connectionStatus, setConnectionStatus] = useState<ConnectionEvent>({
    isConnected: false,
    fetchingConversations: false,
    connecting: false,
  });

  const reconnect = () => {
    if (client) {
      client.initializeUser(user, {
        connectionConfig: { reset: true },
      });
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

  var sortConversations = (data: ConversationListMeta) => {
    const values = Object.values(data).flat();
    try {
        values.sort(
          (a, b) =>
            new Date(b.lastMessage?.createdAt).getTime() -
            new Date(a.lastMessage?.createdAt).getTime()
        );
        return values
    } catch (error) {
      return values
    }
  }

  const handleConversationListChanged = (
    event: ChatEventGenerics<{ conversationListMeta: ConversationListMeta }>
  ) => {
    try {
      setConversationList(sortConversations(event.conversationListMeta));
    } catch (error) {
    }
  };

  useEffect(() => {
    if (client) {
      setUserMeta(user);
      client.initializeUser(user);
    }
  }, [user]);

  useEffect(() => {
    const res = client.getConversations();
    setConversationList(sortConversations(res))
    client.subscribe(Events.CONNECTION_CHANGED, handleConnectionChanged);
    client.subscribe(
      Events.CONVERSATION_LIST_META_CHANGED,
      handleConversationListChanged
    );
    return () => {
      client.unsubscribe(Events.CONNECTION_CHANGED, handleConnectionChanged);
      client.unsubscribe(
        Events.CONVERSATION_LIST_META_CHANGED,
        handleConversationListChanged
      );
    };
  }, []);

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
              onOpen({ activeConversation: item })
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
          onPress={() =>
            onOpen({ activeConversation: item })
          }
          chatUserId={user.uid}
          key={index}
          conversation={{ ...item.conversation }}
          lastMessage={item.lastMessage}
          unread={item.unread}
          isLastItem={conversationList.length === index + 1}
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
  // console.log(JSON.stringify(conversationList[0]))

  const filteredConversations = useMemo(() => {
    try {
      const userId = user.uid
      const data = conversationList.filter((c) => {
        // Check if any participant in participantList meets the conditions
        const participantMatch = c.conversation.participantList.some((participant) => {
          const username = participant.participantDetails.username.toLowerCase();
          const firstname = participant.participantDetails?.firstname?.toLowerCase() || "";
          const lastname = participant.participantDetails?.lastname?.toLowerCase() || "";
          const uid = participant.participantDetails?.uid;
    
          return (
            uid !== userId && // Exclude participants with this specific userId
            (
              username.includes(searchVal.toLowerCase()) ||
              firstname.includes(searchVal.toLowerCase()) ||
              lastname.includes(searchVal.toLowerCase())
            )
          );
        });
        return participantMatch;
      });
    
      return data;
    } catch (error) {
      return conversationList
    }
  }, [conversationList, searchVal]);


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
            paddingHorizontal: 20,
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
                <View
                  style={{
                    borderWidth: 1,
                    padding: 5,
                    borderColor: theme?.divider,
                    borderRadius: 10,
                    marginTop: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <VoiceMessage media={activeVoiceMessage} textColor="white" />
                  <TouchableOpacity
                    onPress={unload}
                    style={{
                      borderWidth: 1,
                      marginStart: 5,
                      borderColor: theme?.icon,
                      borderRadius: 100,
                      padding: 2,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
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
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <ActivityIndicator />
                      <Text
                        style={{
                          fontFamily,
                          marginStart: 5,
                          color: theme?.text.secondary,
                        }}
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
                              fontFamily,
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
                              fontFamily,
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

                {
                  !connectionStatus.isConnected && (
                    <TouchableOpacity
                      style={{
                        padding: 5,
                        paddingHorizontal: 10,
                        display: connectionStatus.connecting ? "none" : "flex",
                        backgroundColor: theme?.action.primary,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 5,
                      }}
                      onPress={() => reconnect()}
                    >
                      <Text style={{ color: "white", fontFamily }}>
                        Connect
                      </Text>
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
            data={filteredConversations}
            renderItem={renderConversations}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View>
                <Text
                  style={{
                    fontFamily,
                    fontSize: 25,
                    color: theme?.text.secondary,
                  }}
                >
                  Chats
                </Text>
                <Search
                  value={searchVal}
                  setValue={setSearchVal}
                  placeholder="Search chats"
                  containerStyle={{ paddingHorizontal: 0 }}
                />
              </View>
            }
            ListEmptyComponent={
              renderPlaceHolder ? (
                <>
                  {renderPlaceHolder({
                    loading: connectionStatus.fetchingConversations,
                  })}
                </>
              ) : (
                <View style={{ alignItems: "center", marginTop: 50 }}>
                  <ChatIcon size={100} color={theme?.action.primary} />
                  <Text
                    style={{
                      marginStart: 5,
                      color: theme?.text.disabled,
                      marginTop: 20,
                      fontFamily,
                    }}
                  >
                    Your conversations will appear here
                  </Text>
                </View>
              )
            }
          />
        </View>
        <TouchableOpacity
          style={{
            display: users.length > 0 ? "flex" : "none",
            position: "absolute",
            bottom: 70,
            right: 20,
          }}
          onPress={() =>
            displayModal({
              children: (
                <UserList data={users as UserMeta[]} goToChat={() => {}} />
              ),
            })
          }
        >
          <ChatIconPlus size={70} color={theme?.action.primary} />
        </TouchableOpacity>
      </GestureHandlerRootView>
    </>
  );
});

export default Conversations;
