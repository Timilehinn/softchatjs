import {
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  LayoutChangeEvent,
  Dimensions,
  Text,
  Platform,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useAnimatedReaction,
  runOnJS,
  withTiming,
  useSharedValue,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import TrashIcon, {
  AttachmentIcon,
  LockClosed,
  LockOpen,
  MicIcon,
  SendIcon,
  StickerIcon,
} from "../../assets/icons";
import { Colors } from "../../constants/Colors";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SelectedMessage, SendMessage } from ".";
import { Message, MessageStates, SetState } from "../../types";
import { useChatClient } from "../../contexts/ChatClientContext";
import {
  generateConversationId,
  generateFillerTimestamps,
  generateId,
} from "../../utils";
import { useConnection } from "../../contexts/ConnectionProvider";

type ChatInputProps = {
  inputRef: React.RefObject<TextInput>;
  mediaOptionsRef?: React.RefObject<any>;
  openEmojis?: () => void;
  sendMessage: () => void;
  chatUserId: string;
  recipientId: string;
  selectedMessage: SelectedMessage;
};

export default function ChatInput(props: ChatInputProps) {
  const {
    inputRef,
    openEmojis,
    mediaOptionsRef,
    sendMessage,
    chatUserId,
    recipientId,
    selectedMessage,
  } = props;
  var minInputHeight = Platform.OS === "android" ? 30 : 40;
  const { messageBody, setTextMessage, createMessage, globalTextMessage } = useChatClient();
  const { userMeta } = useConnection();
  const [inputHeight, setInputHeight] = useState(minInputHeight);
  const [borderRadius, setBorderRadius] = useState(50);
  const [alignItems, setAlignItems] = useState<"center" | "flex-end">("center");
  const [isRecording, setIsRecording] = useState(false);
  const touchStart = useSharedValue({ x: 0, y: 0, time: 0 });
  const [isMicComponentPressed, setIsMicComponentPressed] = useState(false);
  const inputAnimatedView = useSharedValue(0);
  const deviceWidth = Dimensions.get("window").width;
  const deviceHeight = Dimensions.get("window").height;
  const micDrag = useSharedValue({ x: deviceWidth, y: 0 });
  const [lock, setLock] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const handleLayout = (event: LayoutChangeEvent) => {
    // const { height } = event.nativeEvent.layout;
    // setInputHeight(height);
    // console.log(height, '---height')
    // const direction = height > 60 ? "flex-end" : "center";
    // setAlignItems(direction);
  };

  const emojiSize = 40;
  var noOfColumns = Math.floor(deviceWidth / emojiSize);

  useEffect(() => {
    console.log("re-rendered");
  }, []);

  const hasTyped = useMemo(() => {
    return globalTextMessage.length > 0 ? true : false;
  },[globalTextMessage])

  const getContainerBottomPadding = useMemo(() => {
    let value = 0;
    if (inputHeight > 60) {
      if (alignItems === "flex-end") {
        if (Platform.OS === "ios") {
          value = 0;
        }
        value = 5;
      }
      if (Platform.OS === "android") value = 10;
    } else {
      if (Platform.OS === "android") {
        value = 10;
      }
    }
    return value;
  }, []);

  const pan = Gesture.Pan()
    .onTouchesDown((e) => {
      console.log("--------------");
      console.log("start");
      // runOnJS(setIsMicComponentPressed)(true);
      touchStart.value = {
        y: e.changedTouches[0].y,
        x: e.changedTouches[0].x,
        time: 0,
      };
      // inputAnimatedView.value = withTiming(-deviceWidth, {
      //   duration: 300
      // })
    })
    .onChange((e) => {
      micDrag.value = {
        y: e.absoluteY,
        x: e.absoluteX,
      };
      // console.log(
      //   {
      //     y: e.absoluteY,
      //     x: e.absoluteX
      //   }
      // )

      console.log(e.absoluteX);
      if (deviceHeight - e.absoluteY > 100) {
        // inputAnimatedView.value =
        runOnJS(setLock)(true);

        console.log("now less");
      }
    })
    .onTouchesUp((e) => {
      if (deviceHeight - e.changedTouches[0].absoluteY > 100) {
        console.log("locked");
      } else {
        runOnJS(setLock)(false);
        inputAnimatedView.value = withTiming(0, {
          duration: 300,
        });
      }
      micDrag.value = {
        y: 0,
        x: deviceWidth,
      };
    })
    .onEnd(() => {
      console.log("ended");

      // runOnJS(setIsMicComponentPressed)(false)
    });
  // .onEnd((e) => {
  //   runOnJS(setIsMicComponentPressed)(false)
  // })
  // .onFinalize(() => {
  //     runOnJS(setIsMicComponentPressed)(false)
  // })
  const longPress = Gesture.LongPress()
    .minDuration(500)
    .maxDistance(100)
    .onStart(() => {
      inputAnimatedView.value = withTiming(-deviceWidth, {
        duration: 300,
      });
    })
    .onFinalize(() => {});

  useAnimatedReaction(
    () => {
      return { micDrag, inputAnimatedView };
    },
    (result, previous) => {
      if (result.inputAnimatedView.value === -deviceWidth) {
        // runOnJS(setIsRecording)(true)
      } else {
        // runOnJS(setIsRecording)(false)
      }
    }
  );

  // const Recorder = useCallback(() => {
  //   return (
  //     <View
  //       style={{
  //         height: 110,
  //         width: "100%",
  //         backgroundColor: "lightblue",
  //       }}
  //     >
  //       <TouchableOpacity
  //         style={{ padding: 10, backgroundColor: "red" }}
  //         onPress={() => setIsMicComponentPressed(false)}
  //       >
  //         <Text>Close</Text>
  //       </TouchableOpacity>
  //     </View>
  //   );
  // }, []);

  const micStyles = useAnimatedStyle(() => ({
    // transform: [
    //   { scale: interpolate(inputAnimatedView.value, [0, -deviceWidth], [1, 3.5]) },
    // ]
  }));

  const animatedInputContainerStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: inputAnimatedView.value }],
  }));

  const swipeTextStyles = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          micDrag.value.x,
          [deviceWidth - 50, 50],
          [0, -100],
          Extrapolation.CLAMP
        ),
      },
    ],
    opacity: interpolate(micDrag.value.x, [deviceWidth - 50, 40], [1, 0]),
  }));

  const lockStyles = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          inputAnimatedView.value,
          [0, -deviceWidth],
          [0, -100]
        ),
      },
    ],
    opacity: interpolate(inputAnimatedView.value, [0, -deviceWidth], [0, 1]),
  }));

  var right = (deviceWidth * 40) / 100;

  const inputContainerStyles = useAnimatedStyle(() => ({
    // backgroundColor: micDrag.value.x < deviceWidth /2 ? 'red' : 'white'
    // backgroundColor: interpolateColor(micDrag.value.x,
    //   [deviceWidth/2, 0], // Define the range of input colors
    //   ['white', 'red'], // Define the corresponding output colors
    // )
  }));

  const recordingStyles = useAnimatedStyle(() => ({
    transform: [
      { translateX: withTiming(inputAnimatedView.value, { duration: 10 }) },
    ],
    opacity: interpolate(inputAnimatedView.value, [50, -deviceWidth], [0, 1]),
  }));

  const composed = Gesture.Simultaneous(longPress, pan);

  const deleteActiveRecording = () => {
    setLock(false);
        inputAnimatedView.value = withTiming(0, {
          duration: 300,
        });
  }

  const renderMicrophone = useCallback(() => {
    return (
      <GestureDetector gesture={composed}>
        <View
          style={{
            alignItems: "center",
          }}
        >
          <Animated.View
            style={[
              {
                height: 40,
                width: 40,
                borderRadius: 50,
                position: "absolute",
                bottom: 0,
                right: -1,
                opacity: 0,
                alignItems: "center",
                justifyContent: "center",
              },
              lockStyles,
            ]}
          >
            {lock ? (
              <View style={{
                padding: 3,
                backgroundColor: 'green',
                height: 35,
                width: 35,
                borderRadius: 35,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <LockClosed color="white" size={25} />
              </View>
            ) : (
              <View style={{
                padding: 3,
                borderRadius: 5,
                backgroundColor: 'lightgrey'
              }}>
                <LockOpen color="white" size={25} />
              </View>
            )}
          </Animated.View>
          <Animated.View style={[{ marginStart: 8, padding: 2 }, micStyles]}>
            {lock ? (
              <TouchableOpacity
                style={{
                  padding: 5,
                  marginBottom: -5,
                  borderRadius: 50,
                  backgroundColor: "lightblue",
                }}
              >
                <SendIcon color="white" size={25} />
              </TouchableOpacity>
            ) : (
              <MicIcon size={30} />
            )}
          </Animated.View>
        </View>
      </GestureDetector>
    );
  }, [lock]);

  // if(isMicComponentPressed) {
  //   return (
  //     <Recorder />
  //   )
  // }
  const sendMessage2 = () => {
    const conversationId = generateConversationId(chatUserId, recipientId);
    const messageId = generateId();

    const newMessage: Message = {
      conversationId,
      from: chatUserId as string,
      to: recipientId,
      message: globalTextMessage,
      messageState: MessageStates.LOADING,
      replyTo: selectedMessage?.message
        ? JSON.stringify({
            message: selectedMessage.message.message,
            messageId: selectedMessage.message.messageId,
          })
        : undefined,
      messageId,
      attachedMedia: messageBody.attachedMedia,
      attachmentType: messageBody.attachmentType,
      createdAt: new Date(),
      updatedAt: new Date(),
      messageOwner: {
        uid: chatUserId,
        connectionId: "--",
        projectId: "--",
        meta: userMeta,
        ...generateFillerTimestamps(),
      },
    };

    createMessage(newMessage);
    setTextMessage("");
  };

  const renderEmoji = useCallback(({ item, index }: { item: any, index: number }) => {

    return (
      <TouchableOpacity
        key={index}
        onPress={() => {
          // createMessage(newMessage);
          console.log(globalTextMessage, '---globalTextMessage')
          setTextMessage(`${globalTextMessage}${item.emoji}`);
          // closeSheet();
        }}
        style={{
          height: emojiSize,
          minWidth: emojiSize,
          alignItems: "center",
          margin: .7,
          flex: 1,
          justifyContent: "center",
          backgroundColor: Colors.greyLighter,
          borderRadius: emojiSize
        }}
      >
        {/* <Image
          source={{ uri: item.images.preview_gif.url }}
          style={{ height: 40, width: 40 }}
        /> */}
        <Text style={{ fontSize: 30 }}>{item.emoji}</Text>
      </TouchableOpacity>
    );
  }, [messageBody]);

  return (
    <Animated.View
      style={[
        {
          ...styles.main,
          alignItems,
          paddingBottom: getContainerBottomPadding,
        },
        inputContainerStyles,
      ]}
    >
      <Animated.View
        style={[
          {
            flexDirection: "row",
            alignItems: alignItems,
            flex: 1,
          },
          animatedInputContainerStyles,
        ]}
      >
        {openEmojis && (
          <TouchableOpacity onPress={() => openEmojis?.()} style={{ marginEnd: 8 }}>
            <StickerIcon size={23} />
          </TouchableOpacity>
        )}
        
        <TextInput
          // onLayout={handleLayout}
          ref={inputRef}
          style={{
            ...styles.textInput,
            // paddingTop: 10,
          }}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          multiline
          defaultValue={globalTextMessage}
          onChangeText={(value) => setTextMessage(value)}
        />
        
        {!hasTyped && mediaOptionsRef && (
          <TouchableOpacity
            onPress={() => {
              mediaOptionsRef?.current.open();
              inputRef?.current.blur();
            }}
            style={{ marginStart: 5 }}
          >
            <AttachmentIcon size={26} />
          </TouchableOpacity>
        )}
        {hasTyped && (
          <TouchableOpacity activeOpacity={1} onPress={() => sendMessage()}>
            <SendIcon size={35} />
          </TouchableOpacity>
        )}
      </Animated.View>
      <Animated.View
        style={[
          {
            height: 50,
            width: "100%",
            flex: 1,
            backgroundColor: "white",
            position: "absolute",
            left: deviceWidth + 10,
            bottom: 0,
            alignItems: "center",
            justifyContent: "space-between",
            flexDirection: "row",
            paddingHorizontal: 15,
            borderTopWidth: 0.5,
            borderTopColor: Colors.greyLighter,
          },
          recordingStyles,
        ]}
      >
        <TouchableOpacity
        onPress={deleteActiveRecording}
        >
        <TrashIcon />
        </TouchableOpacity>

        <View style={{ opacity: 0 }}>
          <TrashIcon />
        </View>
      </Animated.View>
      {!hasTyped && (
      <>{renderMicrophone()}</>
      )}


      {/* EMOJI STUFF */}
      {/* <View
          style={{
            height: 300,
            width: "100%",
            paddingTop: 10
          }}
        >
          <FlashList
            numColumns={noOfColumns}
            data={emojis}
            estimatedItemSize={8000}
            renderItem={renderEmoji}
            ListFooterComponent={() => <View style={{ height: 100 }} />}
          />
        </View> */}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  main: {
    width: "100%",
    flexDirection: "row",
    paddingHorizontal: 15,
    borderTopWidth: 0.5,
    borderTopColor: Colors.greyLighter,
    alignItems: "center",
    paddingVertical: Platform.OS === "ios" ? 10 : 10,
    maxHeight: 110,
  },
  textInput: {
    maxHeight: 100,
    height: Platform.OS === "ios" ? "100%" : "100%",
    width: "100%",
    paddingHorizontal: 10,
    flex: 1,
    fontSize: 18,
    borderRadius: 15,
    backgroundColor: Colors.greyLighter,
    padding: Platform.OS === "ios" ? 5 : 2,
  },
});
