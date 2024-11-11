import React from "react";
import {
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Text,
  Platform,
  ActivityIndicator,
  ViewStyle
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import TrashIcon, {
  AttachmentIcon,
  CloseIcon,
  LockClosed,
  LockOpen,
  MicIcon,
  PauseIcon,
  PlayIcon,
  SendIcon,
  StickerIcon,
  StopIcon,
} from "../../assets/icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useConfig } from "../../contexts/ChatProvider";
import { Audio } from "expo-av";
import { AudioWaves } from "./ChatItem/Media/VoiceMessage";
import { Children } from "../../types";
import { useMessageState } from "../../contexts/MessageStateContext";
import { ConversationType } from 'softchatjs-core'
 
type RecordingStatus = {
  canRecord: boolean;
  durationMillis: number;
  isRecording: boolean;
  mediaServicesDidReset: boolean;
  metering: number;
};

type ChatInputProps = {
  inputRef: React.RefObject<TextInput>;
  mediaOptionsRef?: React.RefObject<any>;
  openEmojis?: () => void;
  sendMessage: () => void;
  chatUserId: string;
  // recipientId: string;
  // selectedMessage: SelectedMessage;
  hasEmojis?: boolean;
  value: string;
  setValue: (value: string) => void;
  isEditing?: boolean;
  onStopEditing?: () => void;
  messageType?: "text" | "multimedia-text";
  conversationId: string;
  recipientId: string;
  audioWaves?: { [key: number]: { metering: number; height: number } };
  isLoading?: boolean;
  sendVoiceMessage?: () => void;
  onStartRecording?: () => void;
  onDeleteRecording?: () => void;
  isRecording?: boolean;
  audioTime?: number;
  // conversationType: ConversationType
};

const ActionContainer = ({
  loading,
  onPress,
  children,
  style
}: {
  loading: boolean;
  onPress: () => void;
  children: Children;
  style?: ViewStyle
}) => {
  if (loading) {
    return <ActivityIndicator style={{ ...style }} />;
  }
  return (
    <TouchableOpacity
      disabled={loading}
      style={{
        padding: Platform.OS === "ios" ? 3 : 1.5,
        borderRadius: 100,
        ...style,
      }}
      onPress={onPress}
    >
      {children}
    </TouchableOpacity>
  );
};

export const METERING_MIN_POWER = Platform.select({
  default: -50,
  android: -100,
});

export default function ChatInput(props: ChatInputProps) {
  const {
    inputRef,
    openEmojis,
    mediaOptionsRef,
    sendMessage,
    // chatUserId,
    // recipientId,
    // selectedMessage,
    hasEmojis = true,
    value,
    setValue,
    isEditing,
    onStopEditing,
    messageType = "text",
    conversationId,
    recipientId,
    isLoading = false,
    audioWaves = {},
    sendVoiceMessage,
    onStartRecording,
    onDeleteRecording,
    isRecording = false,
    audioTime = 0,
  } = props;

  const { theme } = useConfig();

  var minInputHeight = Platform.OS === "android" ? 30 : 40;
  const { addNewPendingMessages, pauseVoiceMessage } = useMessageState();
  const { client, fontFamily } = useConfig();
  const [inputHeight, setInputHeight] = useState(minInputHeight);
  const [alignItems, setAlignItems] = useState<"center" | "flex-end">("center");
  const touchStart = useSharedValue({ x: 0, y: 0, time: 0 });
  const inputAnimatedView = useSharedValue(0);
  const deviceWidth = Dimensions.get("window").width;
  const deviceHeight = Dimensions.get("window").height;
  const micDrag = useSharedValue({ x: deviceWidth, y: 0 });
  const [lock, setLock] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording>();
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  // const [audioTime, setAudioTime] = useState(0);
  // const [audioWaves, setAudioWaves] = useState<{ [key: number]: { metering: number, height: number } }>({});
  const [sound, setSound] = useState();
  const [audioFileUri, setAudioFileUri] = useState("");
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);
  const [voiceMessageState, setVoiceMessageState] = useState<
    "inactive" | "recording" | "paused" | "stopped"
  >("inactive");

  useEffect(() => {
    console.log("re-rendered 3");
  }, []);

  const hasTyped = useMemo(() => {
    if (messageType === "text") {
      return value.length > 0 ? true : false;
    }

    // just to stop the send btn from being disabled incase of a multimedia-text message
    return true;
  }, [value]);

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

  async function pauseRecording() {
    recording?.pauseAsync();
    setVoiceMessageState("paused");
  }

  async function continueRecording() {
    recording?.startAsync();
    setVoiceMessageState("recording");
  }

  async function stopRecording() {}

  if (isRecording) {
    return (
      <View
        style={[
          {
            ...styles.main,
            alignItems,
            flexDirection: "column",

            paddingBottom: getContainerBottomPadding,
            borderTopColor: theme?.divider,
            justifyContent: "space-between",
          },
        ]}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 0,
          }}
        >
          <TouchableOpacity
            style={{
              padding: Platform.OS === "ios" ? 3 : 1.5,
              borderRadius: 100,
              // backgroundColor: theme?.icon,
            }}
            onPress={() => onDeleteRecording?.()}
          >
            <TrashIcon color={theme?.icon} />
          </TouchableOpacity>
          <AudioWaves
            type="record"
            audioTime={audioTime}
            audioWaves={audioWaves}
          />
          <ActionContainer
            loading={isLoading}
            onPress={() => sendVoiceMessage?.()}
          >
            <SendIcon size={30} color={theme?.icon} />
          </ActionContainer>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        {
          ...styles.main,
          alignItems,
          paddingBottom: getContainerBottomPadding,
          borderTopColor: theme?.divider,
        },
      ]}
    >
      <View
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
          },
        ]}
      >
        {hasEmojis && (
          <TouchableOpacity
            onPress={() => {
              mediaOptionsRef?.current.pickAttachment();
              inputRef?.current?.blur();
            }}
            style={{
              marginEnd: 5,
              marginBottom: 3,
              display: isEditing ? "none" : "flex",
            }}
          >
            <AttachmentIcon size={26} color={theme?.icon} />
          </TouchableOpacity>
        )}

        <View
          style={{
            backgroundColor: theme?.background.secondary,
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 15,
            padding: Platform.OS === "ios" ? 5 : 2,
          }}
        >
          <TextInput
            ref={inputRef}
            style={{
              ...styles.textInput,
              color: theme?.text.secondary,
              backgroundColor: theme?.background.secondary,
              fontFamily
            }}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            multiline
            defaultValue={value}
            onChangeText={(value) => setValue(value)}
          />
          {hasEmojis && (
            <TouchableOpacity
              onPress={() => openEmojis?.()}
              style={{ padding: 4, display: isEditing ? "none" : "flex" }}
            >
              <StickerIcon size={18} color={theme?.icon} />
            </TouchableOpacity>
          )}
        </View>

        {/* {!hasTyped && mediaOptionsRef && (
         <></>
        )} */}
        {isEditing && (
          <TouchableOpacity
            activeOpacity={0.7}
            style={{
              marginStart: 10,
              marginEnd: 5,
              padding: Platform.OS === "ios" ? 3 : 1.5,
              borderRadius: 100,
              backgroundColor: "red",
            }}
            onPress={() => onStopEditing?.()}
          >
            <CloseIcon bgColor="transparent" size={23} color="white" />
          </TouchableOpacity>
        )}
        {hasTyped ? (
          <TouchableOpacity
            disabled={!hasTyped || isLoading}
            activeOpacity={0.7}
            style={{
              opacity: hasTyped ? 1 : 0.3,
              marginStart: 5,
              padding: Platform.OS === "ios" ? 3 : 1.5,
              borderRadius: 100,
              // backgroundColor: theme?.icon,
            }}
            onPress={() => sendMessage()}
          >
            {isLoading ? (
              <ActivityIndicator />
            ) : (
              <SendIcon
                size={30}
                color={
                  messageType === "multimedia-text" ? "white" : theme?.icon
                }
              />
            )}
          </TouchableOpacity>
        ) : (
          <ActionContainer loading={isLoading} style={{ marginLeft: 5 }} onPress={() => onStartRecording?.()}>
            <MicIcon color={theme?.icon} />
          </ActionContainer>
          
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    width: "100%",
    flexDirection: "row",
    paddingHorizontal: 10,
    borderTopWidth: 0.5,

    alignItems: "center",
    paddingVertical: Platform.OS === "ios" ? 10 : 10,
    maxHeight: 110,
  },
  textInput: {
    maxHeight: 100,
    fontSize: 18,
    height: Platform.OS === "ios" ? "100%" : "100%",
    width: "100%",
    paddingHorizontal: 10,
    borderRadius: 10,
    flex: 1,
  },
});
