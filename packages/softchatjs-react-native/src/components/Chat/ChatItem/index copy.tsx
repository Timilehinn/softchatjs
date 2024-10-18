import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Platform,
  TouchableWithoutFeedback,
  Dimensions,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolation,
  useAnimatedReaction,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  AttachmentTypes,
  ChatBubbleRenderProps,
  Conversation,
  Message,
  MessageStates,
  ServerActions,
} from "../../../types";
import {
  ClockIcon,
  DoubleCheck,
  ErrorIcon,
  ReplyIcon,
  SingleCheck,
} from "../../../assets/icons";
import { formatMessageTime } from "../../../utils";
import { useConnection } from "../../../contexts/ConnectionProvider";
import Sticker from "./Sticker";
import Quoted from "./Quoted";
import { Colors } from "../../../constants/Colors";
import Reactions from "./Reactions";
import Haptics from "../../../helpers/haptics";
import ImageAttachment from "./Image";
import MessageAvatar from "../MessageAvatar";
import palette from "../../../theme/pallete";
import Stacked from "./Layouts/Stacked";

type OnSelectedMessage = {
  message: Message;
  chatItemRef: React.MutableRefObject<View | undefined>;
  isMessageOwner: boolean;
};

type ChatItemProps = {
  inputRef: React.RefObject<TextInput>;
  position: "left" | "right";
  onSelectedMessage: ({ message, chatItemRef }: OnSelectedMessage) => void;
  message: Message;
  conversation: Conversation | null;
  onLongPress: (data: OnSelectedMessage) => void;
  chatUserId: string;
  recipientId: string;
  renderChatBubble?: (props: ChatBubbleRenderProps) => void;
  layout?: "stacked";
};

export function ChatItem(props: ChatItemProps) {
  const {
    layout,
    inputRef,
    position,
    message,
    onSelectedMessage,
    conversation,
    onLongPress,
    chatUserId,
    recipientId,
    renderChatBubble,
  } = props;
  const {
    conversation: conversationStore,
    socket,
    wsAccessConfig,
  } = useConnection();
  const chatItemRef = useRef<View>(null);
  const pressed = useSharedValue(false);
  const offset = useSharedValue(0);
  const [hapticState, setHapticState] = useState(false);
  const [os, setOS] = useState(offset.value);
  const [touched, setTouched] = React.useState(false);
  const [finished, setFinished] = React.useState(false);
  const [threshHoldReached, setThreshHoldReached] = React.useState(false);
  const [messageState, setMessageState] = useState<MessageStates>(
    MessageStates.LOADING
  );
  // const [ uploading, showUploading ] = useState(false);

  const touchStart = useSharedValue({ x: 0, y: 0, time: 0 });
  const touchStartY = useSharedValue(0);
  const touchStartX = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const maxThreshHold = -90;
  const TOUCH_SLOP = Platform.OS === "android" ? 40 : 10;
  const DISTANCE_TO_ACTIVATE_PAN = 70;
  const deviceWidth = Dimensions.get("window").width;
  // const

  const pan = Gesture.Pan()
    .minDistance(DISTANCE_TO_ACTIVATE_PAN)
    .onTouchesDown((e, state) => {
      touchStart.value = {
        x: e.changedTouches[0].x,
        y: e.changedTouches[0].y,
        time: Date.now(),
      };
    })
    .onTouchesMove((e, state) => {
      if (messageState < MessageStates.SENT) {
        return;
      }
      touchStartX.value = e.changedTouches[0].x;
      if (e.changedTouches[0].x + TOUCH_SLOP < touchStart.value.x) {
        state.activate();
      }
    })
    .onTouchesUp((e, state) => {
      touchStartX.value = 0;
      state.fail();
    })
    .onUpdate((e) => {
      if (Math.abs(e.translationX) < deviceWidth * (30 / 100)) {
        offset.value = e.translationX;
      }
    })
    .onFinalize(() => {
      isDragging.value = false;
      offset.value = withSpring(0, {
        damping: 100,
      });
      pressed.value = false;
    });

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value < -1 ? offset.value : 0 }],
  }));

  const shareStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      offset.value,
      [-30, -100],
      [0, 1],
      Extrapolation.CLAMP
    ),
    transform: [
      {
        translateX: interpolate(
          offset.value,
          [-1, -100],
          [-1, -50],
          Extrapolation.CLAMP
        ),
      },
      {
        scale: interpolate(
          offset.value,
          [-30, -50],
          [0, 1],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  useAnimatedReaction(
    () => {
      return {
        offsetValue: offset.value,
        pressedValue: pressed.value,
        touchValue: touchStart.value,
      };
    },
    (result, previous) => {
      var value = Math.ceil(result.offsetValue);
      var value2 = result.pressedValue;
      if (value < maxThreshHold + 10) {
        runOnJS(setThreshHoldReached)(true);
        runOnJS(setFinished)(!value2);
      } else {
        runOnJS(setFinished)(false);
        runOnJS(setThreshHoldReached)(false);
      }
    }
  );

  useEffect(() => {
    if (threshHoldReached) {
    }
  }, [threshHoldReached]);

  useEffect(() => {
    if (finished) {
      onSelectedMessage({ message, chatItemRef });
      inputRef.current?.focus();
      Haptics.medium();
    }
  }, [finished]);

  useEffect(() => {
    // try {
    //   if(message.messageState >= MessageStates.SENT){
    //     setMessageState(message.messageState)
    //     return
    //   }
    //   if (!socket) {
    //     console.log('no socket')
    //     return;
    //   }
    //   let updatedMessage = message;
    //     conversationStore.setConversations(
    //       (prevConversations: Conversation[]) => {
    //         return prevConversations.map((conver: Conversation) => {
    //           if (conver.conversationId === message?.conversationId) {
    //             const updatedMessages = conver.messages.map((msg: Message) => {
    //               if (msg.messageId === message.messageId) {
    //                 return { ...msg, messageState: MessageStates.SENT };
    //               }
    //               return msg;
    //             });
    //             return { ...conver, messages: updatedMessages };
    //           }
    //           return conver;
    //         });
    //       }
    //     );
    //     updatedMessage = { ...message, messageState: MessageStates.SENT };
    //     if (!wsAccessConfig.token) {
    //       console.log("No message token");
    //     }
    //     const socketMessage = {
    //       action: ServerActions.SEND_MESSAGE,
    //       message: {
    //         messageId: updatedMessage.messageId,
    //         from: updatedMessage.from,
    //         to: updatedMessage.to,
    //         message: updatedMessage,
    //         token: wsAccessConfig.token,
    //       },
    //     };
    //     socket.send(JSON.stringify(socketMessage));
    //     setMessageState(MessageStates.SENT);
    // } catch (error) {
    //   setMessageState(MessageStates.FAILED);
    // }
  }, [message]);

  const CheckIcon = useCallback(() => {
    switch (message.messageState) {
      case MessageStates.FAILED:
        return <ErrorIcon size={18} />;
      case MessageStates.LOADING:
        return <ClockIcon size={12} />;
      case MessageStates.SENT:
        return <SingleCheck />;
      case MessageStates.READ:
        return <DoubleCheck />;
      default:
        return <ClockIcon size={12} />;
    }
  }, [message]);

  const renderStateIcon = useCallback(() => {
    switch (message.messageState) {
      case MessageStates.FAILED:
        return <ErrorIcon size={18} />;
      case MessageStates.LOADING:
        return <ClockIcon size={12} />;
      case MessageStates.SENT:
        return <SingleCheck />;
      case MessageStates.READ:
        return <DoubleCheck />;
      default:
        return <ClockIcon size={12} />;
    }
  }, [message]);

  const RenderAttachment = useCallback(() => {
    switch (message.attachmentType) {
      case AttachmentTypes.STICKER:
        return <Sticker message={message} />;
      case AttachmentTypes.MEDIA:
        return <ImageAttachment message={message} />;
      default:
        return <></>;
    }
  }, [message]);

  const quotedMessage = useMemo(() => {
    if (!message.replyTo || !conversation) return null;
    const quotedMessageParsed: { messageId: string; message: string } =
      JSON.parse(message.replyTo as string);
    console.log(quotedMessageParsed, message.replyTo, "---common");

    var _msg = conversation.messages.find(
      (msg) => msg.messageId === quotedMessageParsed?.messageId
    );
    console.log(_msg);
    return _msg;
  }, []);

  const renderAvatar = () => {
    if (layout === "stacked") {
      return (
        <MessageAvatar
          size={50}
          initials="TG"
          imgUrl=""
          style={{ marginEnd: 5 }}
        />
      );
    }
    if (
      renderChatBubble === undefined &&
      position === "left" &&
      conversation?.conversationType === "group-chat"
    ) {
      return (
        <MessageAvatar
          size={50}
          initials="TG"
          imgUrl=""
          style={{ marginEnd: 5 }}
        />
      );
    }
  };

  const hasTextMessage = useMemo(() => {
    return message.message.length > 0;
  }, [message.message]);

  let stackedStyle: ViewStyle = {
    borderBottomLeftRadius: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    alignItems: "flex-start",
    backgroundColor: "transparent",
  };

  let rightStyle: ViewStyle = {
    borderBottomRightRadius: 3,
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    alignItems: "flex-end",
    backgroundColor: palette.primary.light,
  };

  let leftStyle: ViewStyle = {
    borderBottomLeftRadius: 3,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    alignItems: "flex-start",
    backgroundColor: palette.background.paper,
  };

  const messageStyles = () => {
    if (layout === "stacked") {
      return {
        color: palette.text.secondary,
        fontSize: 17,
      };
    }
    if (position === "left") {
      return {
        color: palette.text.secondary,
        fontSize: 17,
      };
    }
    return {
      color: palette.text.primary,
      fontSize: 17,
    };
  };

  const getLayout = () => {
    if (layout === "stacked") {
      <Stacked message={message} animatedStyles={animatedStyles} />;
    }
  };

  return (
    <View ref={chatItemRef} style={{ flex: 1 }}>
      <GestureDetector gesture={pan}>
        <TouchableWithoutFeedback
          onLongPress={() =>
            onLongPress({
              message,
              chatItemRef,
              isMessageOwner: position === "right",
            })
          }
        >
          <View
            style={[
              {
                width: "100%",
                display: "flex",
                marginBottom: renderChatBubble !== undefined ? 0 : 15,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              },
              layout === "stacked" && { marginBottom: 0 },
            ]}
          >
            <Animated.View
              style={[
                animatedStyles,
                {
                  flexDirection: "row",
                  width: "100%",
                  justifyContent:
                    position === "left" ? "flex-start" : "flex-end",
                },
                message.reactions.length > 0 && { marginBottom: 15 },
                position === "left"
                  ? { paddingLeft: 10 }
                  : { paddingRight: 10 },
                renderChatBubble !== undefined && {
                  paddingLeft: 0,
                  paddingRight: 0,
                  marginBottom: 0,
                },
                layout === "stacked" && {
                  borderBottomWidth: 1,
                  borderBlockColor: palette.divider,
                  justifyContent: "flex-start",
                  marginBottom: 0,
                  paddingVertical: 20,
                  paddingHorizontal: 10,
                },
              ]}
            >
              {renderAvatar()}

              {renderChatBubble ? (
                <>{renderChatBubble({ message })}</>
              ) : (
                <View
                  style={[
                    { maxWidth: "80%", padding: 10, borderRadius: 10 },
                    position === "left" ? leftStyle : rightStyle,
                    layout === "stacked" && {
                      width: "100%",
                      maxWidth: "100%",
                      flex: 1,
                      ...stackedStyle,
                    },
                  ]}
                >
                  <Quoted quotedMessage={message.quotedMessage} />
                  {conversation &&
                    conversation.conversationType === "group-chat" &&
                    position === "left" && (
                      <Text style={[{ color: "red" }]}>
                        {message.messageOwner?.username}
                      </Text>
                    )}
                  <RenderAttachment />
                  {hasTextMessage && (
                    <View style={{ flex: 1 }}>
                      <Text style={messageStyles()}>{message?.message}</Text>
                    </View>
                  )}
                  <View
                    style={[
                      {
                        flexDirection: "row",
                        alignItems: "center",
                        width: "auto",
                      },
                      position === "left"
                        ? { alignSelf: "flex-start" }
                        : { alignSelf: "flex-end" },
                      layout === "stacked" && {
                        alignSelf: "flex-start",
                      },
                    ]}
                  >
                    <Text style={[styles.messageTime]}>
                      {formatMessageTime(message.createdAt)}
                    </Text>
                    {position === "right" && <CheckIcon />}
                  </View>
                  {message.lastEdited && (
                    <Text
                      style={{
                        fontSize: 11,
                        fontStyle: "italic",
                        color: palette.text.disabled,
                      }}
                    >
                      (edited)
                    </Text>
                  )}
                  <Reactions
                    layout={layout}
                    reactions={message.reactions}
                    position={position}
                    conversationId={message.conversationId}
                    messageId={message.messageId}
                    chatUserId={chatUserId}
                    recipientId={recipientId}
                  />
                </View>
              )}
            </Animated.View>
            <Animated.View
              style={[
                styles.reply,
                { right: -20, position: "absolute" },
                shareStyle,
              ]}
            >
              <ReplyIcon />
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",

    height: "100%",
  },
  circle: {
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reply: {
    height: 40,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 40,
    backgroundColor: Colors.greyLighter,
  },
  chatContainer: {
    flexGrow: 1,
    paddingBottom: 20, // Adjust as needed
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: "#CCCCCC",
  },
  messageTime: {
    fontSize: 13,
    color: "grey",
  },
  input: {
    flex: 1,
    height: 40, // Adjust as needed
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
  },
});
