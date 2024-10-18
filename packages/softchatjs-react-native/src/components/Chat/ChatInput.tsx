import {
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Text,
  Platform,
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
} from "../../assets/icons";
import { Colors } from "../../constants/Colors";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SelectedMessage, SendMessage } from ".";
import { useChatClient } from "../../contexts/ChatClientContext";
import { useConnection } from "../../contexts/ConnectionProvider";
import { useConfig } from "../../contexts/ChatProvider";
import { Audio } from "expo-av";
import { convertToMinutes, generateId } from "../../utils";
import * as FileSystem from "expo-file-system";
import { AudioWaves } from "./ChatItem/Media/VoiceMessage";
import { AttachmentTypes, MediaType } from "../../types";
import { useMessageState } from "../../contexts/MessageStateContext";

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
  // chatUserId: string;
  // recipientId: string;
  // selectedMessage: SelectedMessage;
  hasEmojis?: boolean;
  value: string;
  setValue: (value: string) => void;
  isEditing?: boolean;
  onStopEditing?: () => void;
  messageType?: "text" | "multimedia-text";
  conversationId: string;
  recipientId: string
};

export const METERING_MIN_POWER = Platform.select({ default: -50, android: -100 })

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
    recipientId
  } = props;

  const { theme } = useConfig();

  var minInputHeight = Platform.OS === "android" ? 30 : 40;
  const { addNewPendingMessages, pauseVoiceMessage } = useMessageState();
    const { client } = useConfig()
  const { userMeta } = useConnection();
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
  const [audioTime, setAudioTime] = useState(0);
  const [audioWaves, setAudioWaves] = useState<{ [key: number]: { metering: number, height: number } }>({});
  const [sound, setSound] = useState();
  const [audioFileUri, setAudioFileUri] = useState("");
  const [ isRecordingPaused, setIsRecordingPaused ] = useState(false)

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

  const onRecordingStatusUpdate = (data: Audio.RecordingStatus) => {
    // console.log(data);
    var durationSecond = data.durationMillis / 1000;
    var metering = data.metering?? -160
    if (durationSecond > 300) {
      
    }
    var interp = interpolate(
      metering,
      [METERING_MIN_POWER, 0],
      [1, 100]
    )
    console.log(interp, '--interp')
    setAudioWaves((prev) => {
      return { ...prev, [durationSecond]: { metering, height: interp } };
    });
    setAudioTime(durationSecond);
  };

  // async function playSound() {
  //   console.log("Loading Sound");
  //   if(audioFileUri) {
  //     console.log(audioFileUri)
  //     const { sound } = await Audio.Sound.createAsync({ uri: audioFileUri });
  //     setSound(sound);
  //     console.log("Playing Sound");
  //     await sound.playAsync();
  //   }
  
  // }

  async function startRecording() {
    try {
      if (permissionResponse?.status !== "granted") {
        console.log("Requesting permission..");
        await requestPermission();
      }
        // pause any audio being played
        pauseVoiceMessage()
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log("Starting recording..");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.LOW_QUALITY,
        onRecordingStatusUpdate
      );
      setRecording(recording);
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function deleteRecording() {
    setRecording(undefined);
    setAudioWaves({})
    setIsRecordingPaused(false)
    await recording?.stopAndUnloadAsync();
  }

  async function pauseRecording() {
    recording?.pauseAsync();
    setIsRecordingPaused(true);
    const uri = recording?.getURI();
    setAudioFileUri(uri as string);
  }

  async function continueRecording() {
    recording?.startAsync();
    setIsRecordingPaused(false)
  }

  async function stopRecording() {
    

  }

  const waves = Object.values(audioWaves).flat();

  const sendVoiceMessage = async () => {
      try {
        console.log("Stopping recording..");
      setRecording(undefined);
      await recording?.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      const uri = recording?.getURI();
      const base64 = await FileSystem.readAsStringAsync(uri as string, {
        encoding: FileSystem.EncodingType.Base64,
      });
    // setAudioFileUri(base64);
          if (client) {
            // remove any audio being played
            pauseVoiceMessage();
            addNewPendingMessages(
              {
                from: client.userMeta.uid,
                  messageId: generateId(),
                  conversationId,
                  to: recipientId,
                  message: "",
                  reactions: [],
                  attachedMedia: [
                    {
                      type: MediaType.AUDIO,
                      ext: 'audio/mp3',
                      mediaId: generateId(),
                      mediaUrl: uri as string,
                      mimeType: 'audio/mp3',
                      meta: {
                        audioDurationSec: audioTime,
                      }
                    }
                  ],
                  attachmentType: AttachmentTypes.MEDIA,
                  quotedMessage: null,
                  createdAt: new Date()
                }
            )
            // client.messageClient(conversationId).sendMessage({
            //   conversationId,
            //   to: recipientId,
            //   message: globalTextMessage,
            //   reactions: [],
            //   attachedMedia: [
            //     {
            //       type: MediaType.AUDIO,
            //       ext: 'audio/mp4',
            //       mediaId: generateId(),
            //       mediaUrl: base64,
            //       audioDurationSec: audioTime,
            //       audioMetering: audioWaves
            //     }
            //   ],
            //   attachmentType: AttachmentTypes.MEDIA,
            //   quotedMessage: null,
            // });
            // if (client) {
            //   client.messageClient(conversationId).sendMessage({
            //     conversationId,
            //     to: recipientId,
            //     message: globalTextMessage,
            //     reactions: [],
            //       attachedMedia: [
            //       {
            //         type: MediaType.AUDIO,
            //         ext: 'audio/mp4',
            //         mediaId: generateId(),
            //         mediaUrl: base64,
            //         audioDurationSec: audioTime,
            //         audioMetering: audioWaves
            //       }
            //   ],
            //   attachmentType: AttachmentTypes.MEDIA,
            //     quotedMessage: null,
            //   });
            // }
            setAudioFileUri("");
          setAudioWaves({})
          }
      } catch (err) {
        console.log(err, "--this error");
      }
  }
  
  if (recording) {
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
        {/* {!isRecordingPaused? (
          <View style={{ flexDirection: 'row', alignItems: 'center',  width: "100%", paddingHorizontal: 10 }}>
            <Text style={{ color: "white", fontSize: 20, marginEnd: 10 }}>
              {convertToMinutes(Number(audioTime.toFixed(0)))}
            </Text>
            <View style={{ height: 60, overflow: 'hidden', flexDirection: 'row', flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
              {waves.map((wave, i) => (
                <View key={i} style={{ width: 2, backgroundColor: theme?.icon, height: `${wave.height}%`, marginEnd: 2, borderRadius: 1 }} />
              ))} 
            </View>
          </View>
        ):( */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 }}> 
            <TouchableOpacity
              style={{
                padding: Platform.OS === "ios" ? 3 : 1.5,
                borderRadius: 100,
                // backgroundColor: theme?.icon,
              }}
              onPress={() => deleteRecording()}
            >
              <TrashIcon color={theme?.icon} />
            </TouchableOpacity>
            {/* <View style={{ flex: 1, marginHorizontal: 5, borderWidth: 1, overflow: 'hidden', borderColor: theme?.divider, borderRadius: 100, paddingHorizontal: 10, height: 35, flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: "white", fontSize: 12, marginEnd: 5 }}>
                {convertToMinutes(Number(audioTime.toFixed(0)))}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', height: '100%', justifyContent: 'flex-end', overflow: 'hidden', flex: 1, paddingHorizontal: 0 }}>
                {waves.map((wave, i) => (
                  <View key={i} style={{ width: 2, backgroundColor: theme?.icon, height: `${wave.height}%`, marginEnd: 2, borderRadius: 1 }} />
                ))}
              </View>
            </View> */}
            <AudioWaves type="record" audioTime={audioTime} audioWaves={audioWaves} />
            <TouchableOpacity
              style={{
                padding: Platform.OS === "ios" ? 3 : 1.5,
                borderRadius: 100,
                // backgroundColor: theme?.icon,
              }}
              onPress={() => sendVoiceMessage()}
            >
              <SendIcon size={30} color={theme?.icon} />
            </TouchableOpacity>
          </View>
        {/* )} */}
        
        {/* <View
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 10,
            paddingHorizontal: 15,
          }}
        >
          <TouchableOpacity
            style={{
              marginStart: 5,
              padding: Platform.OS === "ios" ? 3 : 1.5,
              borderRadius: 100,
              backgroundColor: theme?.icon,
            }}
            onPress={() => deleteRecording()}
          >
            <TrashIcon />
          </TouchableOpacity>
          
          {isRecordingPaused? (
            <TouchableOpacity
              style={{
                marginStart: 5,
                padding: Platform.OS === "ios" ? 3 : 1.5,
                borderRadius: 100,
                backgroundColor: theme?.icon,
              }}
              onPress={() => continueRecording()}
            >
              <MicIcon />
            </TouchableOpacity>
          ):(
          <TouchableOpacity
            style={{
              marginStart: 5,
              padding: Platform.OS === "ios" ? 3 : 1.5,
              borderRadius: 100,
              backgroundColor: theme?.icon,
            }}
            onPress={() => pauseRecording()}
          >
            <PauseIcon />
          </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={{
              marginStart: 5,
              padding: Platform.OS === "ios" ? 3 : 1.5,
              borderRadius: 100,
              backgroundColor: theme?.icon,
            }}
            onPress={() => stopRecording()}
          >
            <SendIcon />
          </TouchableOpacity>
        </View> */}
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
              mediaOptionsRef?.current.open();
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
            alignItems: "flex-end",
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
            disabled={!hasTyped}
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
            <SendIcon size={30} color={messageType === "multimedia-text"? "white" : theme?.icon} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{
              display: isEditing? 'none' : "flex",
              marginStart: 5,
              padding: Platform.OS === "ios" ? 3 : 1.5,
              borderRadius: 100,
              // backgroundColor: theme?.icon,
            }}
            onPress={() => startRecording()}
          >
            <MicIcon color={theme?.icon} />
          </TouchableOpacity>
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
