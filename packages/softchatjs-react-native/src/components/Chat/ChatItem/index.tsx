import React, {
  forwardRef,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Platform,
  Text,
  TouchableWithoutFeedback,
  Dimensions,
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
  Conversation,
  MediaType,
  MessageStates,
  Message,
  generateId
} from "softchatjs-core";
import {
  ClockIcon,
  DoubleCheck,
  ErrorIcon,
  ReplyIcon,
  SingleCheck,
} from "../../../assets/icons";
import { Colors } from "../../../constants/Colors";
import Haptics from "../../../helpers/haptics";
import Stacked from "./Layouts/Stacked";
import Default from "./Layouts/Default";
import { useConfig } from "../../../contexts/ChatProvider";
import { useMessageState } from "../../../contexts/MessageStateContext";
import { ChatBubbleRenderProps } from "@/src";

type OnSelectedMessage = {
  message: Message;
  chatItemRef: React.MutableRefObject<View | undefined>;
};

type ChatItemProps = {
  inputRef: React.RefObject<TextInput>;
  position: "left" | "right";
  onSelectedMessage: ({ message, chatItemRef }: OnSelectedMessage) => void;
  message: Message;
  conversation: Conversation | null;
  onLongPress: (data: OnSelectedMessage & { isMessageOwner: boolean }) => void;
  chatUserId: string;
  recipientId: string;
  renderChatBubble?: (props: ChatBubbleRenderProps) => void;
  layout?: "stacked";
  onScrollToIndex: (messageId: string) => void;
  isPending?: boolean,
  threaded?: boolean
};

export const ChatItem = forwardRef((props: ChatItemProps, ref: any) => {
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
    onScrollToIndex,
    isPending,
    threaded
  } = props;
  const { client } = useConfig();
  const pressed = useSharedValue(false);
  const offset = useSharedValue(0);
  const [finished, setFinished] = React.useState(false);
  const [threshHoldReached, setThreshHoldReached] = React.useState(false);
  const [messageState, setMessageState] = useState<MessageStates>(
    MessageStates.LOADING
  );
  const { removePendingMessage, updatePendingMessage } = useMessageState();

  const touchStart = useSharedValue({ x: 0, y: 0, time: 0 });
  const touchStartX = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const maxThreshHold = -90;
  const TOUCH_SLOP = Platform.OS === "android" ? 40 : 10;
  const DISTANCE_TO_ACTIVATE_PAN = 70
  const deviceWidth = Dimensions.get("window").width;

  const pan = Gesture.Pan()
  .enabled(conversation.conversationType !== "admin-chat")
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
    ] as any,
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

  const uploadAttachment = async () => {
    try {
      if(client && conversation){
        var media =  message.attachedMedia[0];
        const res = await client.messageClient(conversation?.conversationId).uploadFile(
          media.mediaUrl,
          {
            filename: `${generateId()}${media.ext}`,
            mimeType: media.mimeType as string,
            ext: media.ext
          }
        )
        if(res.success){
          removePendingMessage(message.messageId);
          if(conversation.conversationType !== "broadcast-chat"){
            client.messageClient(conversation?.conversationId).sendMessage({
              ...message,
              attachedMedia: [
                {
                  ...media,
                  uploading: false,
                  mediaUrl: res.link,
                }
              ],
            });
          }else{
            client.messageClient(conversation?.conversationId).broadcastMessage({
              broadcastListId: conversation?.conversationId,
              participantsIds: conversation.participants,
              newMessage: {
                ...message,
                attachedMedia: [
                  {
                    ...media,
                    uploading: false,
                    mediaUrl: res.link,
                  }
                ],
              }
            });
          }
        
        }else{
          throw new Error('upload failed');
        }
      }else{
        throw new Error("Client not initialized")
      }
    } catch (error) {
      updatePendingMessage(message.messageId, { ...message, messageState: MessageStates.FAILED });
    }
  }

  const retryUpload = () => {
    updatePendingMessage(message.messageId, { ...message, messageState: MessageStates.LOADING });
  }

  useEffect(() => {
    if(isPending && message.messageState !== MessageStates.FAILED){
      uploadAttachment();
    }
  },[ isPending, message ])

  useEffect(() => {
    if (finished) {
      onSelectedMessage({ message, chatItemRef: ref });
      inputRef.current?.focus();
      Haptics.medium();
    }
  }, [finished]);


  const renderStateIcon = useCallback((color: string) => {
    switch (message.messageState) {
      case MessageStates.FAILED:
        return <ErrorIcon size={18} color={color} />;
      case MessageStates.LOADING:
        return <ClockIcon size={12} color={color} />;
      case MessageStates.SENT:
        return <SingleCheck color={color} />;
      case MessageStates.READ:
        return <DoubleCheck color={color} />;
      default:
        return <ClockIcon size={12} color={color} />;
    }
  }, [message]);

  const getLayout = () => {
    if (layout === "stacked") {
      return <Stacked 
        message={message} 
        animatedStyles={animatedStyles}
        renderStateIcon={renderStateIcon}
        chatUserId={chatUserId}
        recipientId={recipientId}
        myMessage={position === 'right'}
        onScrollToIndex={(messageId) => onScrollToIndex(messageId)}
        isPending={isPending}
        retryUpload={retryUpload}
       />;
    }
    return <Default 
      message={message} 
      animatedStyles={animatedStyles}
      position={position}
      conversationType={conversation?.conversationType || 'private-chat'}
      renderStateIcon={renderStateIcon}
      chatUserId={chatUserId}
      recipientId={recipientId}
      onScrollToIndex={(messageId) => onScrollToIndex(messageId)}
      isPending={isPending}
      threaded={threaded}
      retryUpload={retryUpload}
    />
  };

  return (
    <View ref={ref} style={{ flex: 1, marginBottom: 10 }}>
      <GestureDetector gesture={pan}>
        <TouchableWithoutFeedback
          onLongPress={() =>
            onLongPress({
              message,
              chatItemRef: ref,
              isMessageOwner: position === "right",
            })
          }
          
        >
          <View
            style={[
              {
                maxWidth: "100%",
                marginBottom: renderChatBubble !== undefined ? 0 : 0,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              },
              layout === "stacked" && { marginBottom: 0 },
              position === "right" ? { justifyContent: 'flex-end' } : { justifyContent: "flex-start" }
            ]}
          >
            <>{renderChatBubble? renderChatBubble({
              message
            }) : getLayout()}</>
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
})



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
