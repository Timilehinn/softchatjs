import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Dimensions,
  Alert,
} from "react-native";
import React, {
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  Video,
  ResizeMode,
  AVPlaybackStatus,
  AVPlaybackStatusSuccess,
} from "expo-av";
import { Media, Message, generateFillerTimestamps, AttachmentTypes, MediaType } from "softchatjs-core";
import TrashIcon, {
  PauseIcon,
  PlayIcon,
  SendIcon,
  XIcon,
} from "../../assets/icons";
import { useConfig } from "../../contexts/ChatProvider";
import { useMessageState } from "../../contexts/MessageStateContext";
import { convertToMinutes, generateId } from "../../utils";
import { useModalProvider } from "../../contexts/ModalProvider";
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  useAnimatedReaction,
  interpolate,
  Easing,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

type VideoViewProps = {
  conversationId?: string;
  clearActiveQuote?: () => void;
  activeQuote: Message | null;
  chatUserId: string;
  recipientId: string;
  media: Media;
  view?: boolean;
  onDelete?: () => void;
};

type AVPlaybackStatusMeta = {
  isLoaded: boolean;
  didJustFinish?: boolean;
  durationMillis?: number;
  hasJustBeenInterrupted?: boolean;
  isBuffering?: boolean;
  isLooping?: boolean;
  isMuted?: boolean;
  isPlaying?: boolean;
  pitchCorrectionQuality?: "Varispeed" | "TimeDomain" | "Spectral";
  playableDurationMillis?: number;
  positionMillis?: number;
  progressUpdateIntervalMillis?: number;
  rate?: number;
  shouldCorrectPitch?: boolean;
  shouldPlay?: boolean;
  target?: number;
  uri?: string;
  volume?: number;
};

type SliderProps = {
  setTimeStamp: (timeStampMillis: number) => void;
  status: AVPlaybackStatusSuccess;
};

var deviceWidth = Dimensions.get("window").width;
const SLIDER_WIDTH = deviceWidth - 50;

Animated.addWhitelistedNativeProps({ text: true });

const Slider = forwardRef(({ setTimeStamp, status }: SliderProps, ref: any) => {
  const offset = useSharedValue(0);
  const MAX_VALUE = SLIDER_WIDTH + 10;
  var duration = status?.durationMillis ?? 0;

  useEffect(() => {
    if (status.shouldPlay && status.isPlaying) {
      var position = status?.positionMillis ?? 0;
      var duration = status?.durationMillis ?? 0;
      offset.value = withTiming(
        Math.ceil(interpolate(position, [0, duration], [0, SLIDER_WIDTH])),
        { duration: 500, easing: Easing.linear }
      );
    }
  }, [status]);

  const pan = Gesture.Pan()
    .onChange((event) => {
      var value =
        Math.abs(offset.value) <= MAX_VALUE
          ? offset.value + event.changeX <= 0
            ? 0
            : offset.value + event.changeX >= MAX_VALUE
              ? MAX_VALUE
              : offset.value + event.changeX
          : offset.value;

      offset.value = value;
    })
    .onFinalize((event) => {
      console.log(event.absoluteX);
      var timeStamp = interpolate(
        event.absoluteX,
        [0, SLIDER_WIDTH],
        [0, duration]
      );
      runOnJS(setTimeStamp)(timeStamp);
    });

  const sliderStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: offset.value }],
    };
  });

  useImperativeHandle(ref, () => ({
    reset: () => (offset.value = 0),
  }));

  return (
    <GestureHandlerRootView style={{}}>
      <View ref={ref} style={styles.sliderTrack}>
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.sliderHandle, sliderStyle]}>
            <View
              style={{
                height: 18,
                width: 18,
                borderRadius: 18,
                backgroundColor: "white",
              }}
            />
          </Animated.View>
        </GestureDetector>
      </View>
    </GestureHandlerRootView>
  );
});



export default function VideoViewer(props: VideoViewProps) {
  const {
    conversationId,
    onDelete,
    clearActiveQuote,
    activeQuote,
    chatUserId,
    recipientId,
    media,
    view,
  } = props;

  const sliderRef = useRef<{ reset: () => void }>(null);
  const { client, fontFamily } = useConfig();
  const { resetModal } = useModalProvider();
  const { addNewPendingMessages } = useMessageState();
  const video = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus & AVPlaybackStatusMeta>({ isLoaded: false });
  const [loading, setLoading] = useState(false);
  const [timePlayedSecs, setTimePlayedSecs] = useState(0);

  const uploadImage = async () => {
    try {
      if (client && media.mediaUrl) {
        var timeStamps = generateFillerTimestamps();
        addNewPendingMessages({
          from: chatUserId,
          messageId: generateId(),
          conversationId,
          to: recipientId,
          message: "",
          reactions: [],
          attachedMedia: [
            {
              uploading: true,
              type: MediaType.VIDEO,
              mimeType: media.mimeType,
              ext: ".mp4",
              mediaId: generateId(),
              mediaUrl: media.mediaUrl,
              meta: {
                aspectRatio: media?.meta?.aspectRatio,
                height: media?.meta?.height,
                width: media?.meta?.width,
                size: media?.meta?.size,
              },
            },
          ],
          messageOwner: {
            ...client?.userMeta,
            ...timeStamps,
          },
          quotedMessageId: activeQuote?.messageId || "",
          attachmentType: AttachmentTypes.MEDIA,
          quotedMessage: activeQuote,
          createdAt: new Date(),
        });
        if (activeQuote?.message) {
          clearActiveQuote?.();
        }
        resetModal();
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
    } finally {
      // showUploading(false)
    }
  };

  useEffect(() => {
    if (video.current) {
      video.current?.setProgressUpdateIntervalAsync(500);
    }
  }, [video]);

  useEffect(() => {
    if (status.didJustFinish) {
      video.current?.setPositionAsync(0);
      sliderRef.current?.reset();
    }
    if (status?.isBuffering || status.isLoaded === false) {
      setLoading(true);
    } else {
      setLoading(false);
    }

    return () => {};
  }, [status]);

  const renderVideoDuration = useCallback(() => {
    var duration = status?.durationMillis ?? 0;
    var position = status?.positionMillis ?? 0;

    return (
      <View>
        {/* <View style={{ height: 4, width: '100%', backgroundColor: 'grey', borderRadius: 5, marginBottom: 10 }}>
          <View style={{ height: '100%', backgroundColor: 'white', width: `${position/duration * 100}%`, borderRadius: 5 }} />
        </View> */}
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: "white", fontFamily }}>
            {convertToMinutes(position / 1000)}
          </Text>
          <Text style={{ color: "white", fontFamily }}>
            {convertToMinutes(duration / 1000)}
          </Text>
        </View>
      </View>
    );
  }, [status]);

  
  const showAlert = () => {
    Alert.alert(
      "Delete video",
      "This action is irreversible. Proceed?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancelled"),
          style: "cancel"
        },
        {
          text: "Proceed",
          onPress: () => { resetModal(); onDelete?.(); },
          style: "destructive"
        }
      ],
      { cancelable: false }
    );
  };

  const deleteMessage = () => {
    if(view){
      showAlert();
    }else{
      resetModal();
    }
  };

  const setTimeStamp = async (position: number) => {
    try {
      if (video.current) {
        await video.current.pauseAsync();
        await video.current.setPositionAsync(position);
        await video.current.playAsync();
      }
    } catch (error) {
      console.error("Error seeking:", error);
    }
  };

  

  return (
    <View style={styles.container}>
      <Video
        style={styles.video}
        ref={video}
        source={{
          uri: media.mediaUrl,
        }}
        useNativeControls
        resizeMode={ResizeMode.COVER}
        // isLooping
        progressUpdateIntervalMillis={500}
        onLoadStart={() => {
          setLoading(true);
          video?.current?.pauseAsync();
        }}
        onLoad={() => {
          video?.current?.playAsync();
          setLoading(false);
        }}
        onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
          setStatus(status as AVPlaybackStatus & AVPlaybackStatusMeta);
          setTimePlayedSecs((prev) => prev + 1);
        }}
      />

      <TouchableWithoutFeedback>
        <View style={{ ...styles.overlay, position: "absolute" }}>
          <View style={styles.header} />
          {/* <TouchableOpacity onPress={() => resetModal()}>
              <XIcon size={30} color="white" />
            </TouchableOpacity> */}
          {/* </View> */}
          {loading && (
            <View
              style={{
                padding: 10,
                alignSelf: "center",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,.5)",
                borderRadius: 10,
              }}
            >
              <ActivityIndicator size="large" color={"white"} />
            </View>
          )}
          <View style={styles.footer}>
            <Slider
              setTimeStamp={setTimeStamp}
              status={status as AVPlaybackStatusSuccess}
              ref={sliderRef}
            />
            {renderVideoDuration()}
            <View style={styles.controls}>
              <TouchableOpacity onPress={deleteMessage}>
                <TrashIcon color="white" size={30} />
              </TouchableOpacity>
              <TouchableOpacity
                disabled={loading}
                onPress={() =>
                  status?.isPlaying
                    ? video?.current?.pauseAsync()
                    : video?.current?.playAsync()
                }
              >
                {status?.isPlaying ? (
                  <PauseIcon color="white" size={30} />
                ) : (
                  <PlayIcon color="white" size={30} />
                )}
              </TouchableOpacity>
              {view ? (
                <TouchableOpacity onPress={() => resetModal()}>
                  <XIcon color="white" size={30} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  disabled={view}
                  style={{ opacity: view ? 0.3 : 1 }}
                  onPress={uploadImage}
                >
                  <SendIcon color="white" size={35} />
                </TouchableOpacity>
              )}
            </View>
            <View style={{ height: 20 }} />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    width: "100%",
    backgroundColor: "black",
    justifyContent: "center",
  },
  video: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
    height: "100%",
    width: "100%",
    left: 0,
    top: 0,
  },
  header: {
    height: 100,
    width: "100%",
    // backgroundColor: "rgba(0,0,0,.6)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 10,
  },
  footer: {
    height: 140,
    width: "100%",
    backgroundColor: "rgba(0,0,0,.6)",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sliderTrack: {
    width: SLIDER_WIDTH,
    height: 3,
    backgroundColor: "white",
    borderRadius: 25,
    justifyContent: "center",
    // padding: 5,
  },
  sliderHandle: {
    width: 40,
    height: 40,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 40,
    position: "absolute",
    left: -20,
  }
});
