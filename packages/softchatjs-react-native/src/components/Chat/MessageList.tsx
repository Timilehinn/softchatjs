// import { createRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
// import {
//   View,
//   TextInput,
// } from "react-native";
// import { Conversation, Message } from "../../types";
// import { ChatItem } from "./ChatItem";
// import SelectedMessage from "./SelectedMessage";
// import {
//   getUnreadMessageIds,
// } from "../../utils";
// import { FlatList } from "react-native-gesture-handler";
// import Haptics from "../../helpers/haptics";

// type ChatProps = {
//   conversationId: string;
//   chatUserId: string;
// };

// export type SendMessage = {
//   message: string;
// };

// export type SelectedMessage = {
//   message: Message | null;
//   ref: React.MutableRefObject<View | undefined> | null;
//   itemIndex: number;
//   isMessageOwner: boolean;
// };

// export default function MessageList(props: ChatProps) {
//   const { conversationId, chatUserId } = props;
//   const scrollRef = useRef<FlatList<Message>>(null);
//   const inputRef = useRef<TextInput>(null);
//   const messageOptionsRef = useRef(null);
//   // const {
//   //   setScreen,
//   //   sendReadNotification,
//   //   clearUserUnreadNotifications,
//   // } = useChatClient();
//   const [currentConversation, setCurrentConversation] =
//     useState<Conversation | null>(null);
//   const [messages, setMessages] = useState<Message[]>([]);
//   // Message selected via long press
//   const [selectedMessage, setSelectedMessage] = useState<SelectedMessage>({
//     message: null,
//     ref: null,
//     itemIndex: 0,
//     isMessageOwner: false,
//   });
//   // quoted message and ref
//   const [activeQuote, setActiveQuote] = useState<
//     Omit<SelectedMessage, "isMessageOwner">
//   >({
//     message: null,
//     ref: null,
//     itemIndex: 0,
//   });
//   const [recipientId, setRecipientId] = useState("");

//   useEffect(() => {
//     console.log('re-rendering')
//   },[])

//   // useEffect(() => {
//   //   setScreen(Screens.CHAT);
//   //   console.log("screen set");

//   //   return () => {
//   //     setScreen(Screens.CONVERSATIONS);
//   //     console.log("screen unset");
//   //   };
//   // }, []);

//   const messageList = useMemo(() => {
//     const currentConversation = conversations.find(
//       ({ conversationId: id }) => id === conversationId
//     );
//     var data = currentConversation?.messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//     return data ? data : [];
//   }, [conversations, conversationId]);

//   useEffect(() => {
//     if (conversationId) {
//       const _currentConversation = conversations.find(
//         (conversation) => conversation.conversationId === conversationId
//       );
//       if (_currentConversation) {
//         /**
//          * @todo get sender and recipient ids from DB
//          */
//         const recipients = _currentConversation?.participants.filter(
//           (id) => id !== chatUserId
//         );
//         setCurrentConversation(_currentConversation);
//         setRecipientId(recipients[0]);
//         setMessages(_currentConversation.messages);
//       }
//     }
//   }, [conversationId]);


//   const onChatItemLongPress = (
//     selectedMessage: Message,
//     ref: React.MutableRefObject<View | undefined>,
//     isMessageOwner: boolean
//   ) => {
//     const messageIndex = messageList.indexOf(selectedMessage);
//     setSelectedMessage({
//       message: selectedMessage,
//       ref: ref,
//       itemIndex: messageIndex,
//       isMessageOwner,
//     });
//     messageOptionsRef?.current?.open();
//     Haptics.medium();
//   };

//   // useEffect(() => {
//   //   if (currentConversation) {
//   //     const unread = getUnreadMessageIds(currentConversation, chatUserId);
//   //     if (unread.length > 0) {
//   //       clearUserUnreadNotifications(
//   //         currentConversation.conversationId,
//   //         unread
//   //       );
//   //       sendReadNotification({
//   //         uid: recipientId,
//   //         messageIds: unread,
//   //       });
//   //     }
//   //   }
//   // }, [currentConversation]);

//   const renderChatItem = useCallback(
//     ({ item, index }: { item: Message; index: number }) => {
//       return (
//         <ChatItem
//           onLongPress={({ message, chatItemRef, isMessageOwner }) =>
//             onChatItemLongPress(message, chatItemRef, isMessageOwner)
//           }
//           inputRef={inputRef}
//           position={chatUserId === item.from ? "right" : "left"}
//           message={item}
//           onSelectedMessage={({ message, chatItemRef }) =>
//             setActiveQuote({ message, ref: chatItemRef, itemIndex: index })
//           }
//           conversation={currentConversation}
//           chatUserId={chatUserId}
//           recipientId={recipientId}
//         />
//         // <View>
//         //   <Text>{item.message}</Text>
//         // </View>
//       );
//     },
//     [currentConversation]
//   );

//   return (
//           <FlatList
//             ref={scrollRef}
//             inverted
//             // onContentSizeChange={() => scrollRef.current?.scrollToEnd()}
//             data={messageList}
//             keyExtractor={(_, index) => index.toString()}
//             ListFooterComponent={() => (
//               <View
//                 style={{
//                   height: 30,
//                 }}
//               />
//             )}
//             style={{
//               height: "90%",
//             }}
//             contentContainerStyle={{
//               paddingTop: 10,
//             }}
//             maxToRenderPerBatch={10}
//             renderItem={renderChatItem}
//             windowSize={5}
//             initialNumToRender={10}
//           />
//   );
// }
