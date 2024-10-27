import {
  View,
  Text,
  StyleSheet,
  Button,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import React, { useRef, useState } from "react";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { Media, Message } from "softchatjs-core/src";
import TrashIcon, { PauseIcon, PlayIcon, SendIcon, XIcon } from "../../assets/icons";
import { useConfig } from "../../contexts/ChatProvider";
import { generateFillerTimestamps } from "softchatjs-core/src/utils";
import { useMessageState } from "../../contexts/MessageStateContext";
import { generateId } from "../../utils";
import { AttachmentTypes, MediaType } from "../../types";
import { useModalProvider } from "../../contexts/ModalProvider";

type VideoViewProps = {
  conversationId?: string;
  clearActiveQuote?: () => {};
  activeQuote: Message | null;
  chatUserId: string;
  recipientId: string;
  media: Media;
  view?: boolean;
};

export default function VideoViewer(props: VideoViewProps) {
  const {
    conversationId,
    clearActiveQuote,
    activeQuote,
    chatUserId,
    recipientId,
    media,
    view,
  } = props;

  const { client } = useConfig();
  const { resetModal } = useModalProvider();
  const { addNewPendingMessages } = useMessageState();
  const video = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [ loading, setLoading ] = useState(false)

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
              mediaUrl: media.base64,
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
        isLooping
        onLoadStart={() => { setLoading(true); video?.current?.pauseAsync(); }}
        onLoad={() => { setLoading(false); video?.current?.playAsync() }}
        onPlaybackStatusUpdate={(status) => setStatus(() => status)}
      />

      <TouchableWithoutFeedback>
        <View style={{ ...styles.overlay, position: "absolute" }}>
          <View style={styles.header}>
            {/* <TouchableOpacity onPress={() => resetModal()}>
              <XIcon size={30} color="white" />
            </TouchableOpacity> */}
          </View>
          {loading && <ActivityIndicator />}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={() => resetModal()}
            >
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
            {view? (
              <TouchableOpacity onPress={() => resetModal()}>
                <XIcon color="white" size={30} />
              </TouchableOpacity>
            ):(
            <TouchableOpacity
              disabled={view}
              style={{ opacity: view ? 0.3 : 1 }}
              onPress={uploadImage}
            >
              <SendIcon color="white" size={35} />
            </TouchableOpacity>
            )}

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 15
  },
  footer: {
    height: 100,
    width: "100%",
    backgroundColor: "rgba(0,0,0,.6)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 30,
  },
});
