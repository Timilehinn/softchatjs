import { useModalProvider } from "../../contexts/ModalProvider";
import TrashIcon, {
  PauseIcon,
  PlayIcon,
  SendIcon,
  XIcon,
} from "../../assets/icons";
import { useConfig } from "../../contexts/ChatProvider";
import { useEvent } from "expo";
import React, { useRef, useState } from "react";
import { useVideoPlayer, VideoView } from "expo-video";
import {
  StyleSheet,
  View,
  Button,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  Message,
  Media,
  generateFillerTimestamps,
  generateId,
  MediaType,
  AttachmentTypes,
} from "softchatjs-core";
import { useMessageState } from "../../contexts/MessageStateContext";

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

const videoSource =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export default function VideoScreen(props: VideoViewProps) {
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

  const { client, fontFamily } = useConfig();
  const { resetModal } = useModalProvider();
  const { userMeta, addNewPendingMessages } = useMessageState();
  const [loading, setLoading] = useState(false);

  const player = useVideoPlayer(media.mediaUrl, (player) => {
    player.loop = true;
    player.play();
  });

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

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
            ...userMeta,
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
        console.log('got here')
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

  const showAlert = () => {
    Alert.alert(
      "Delete video",
      "This action is irreversible. Proceed?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancelled"),
          style: "cancel",
        },
        {
          text: "Proceed",
          onPress: () => {
            resetModal();
            onDelete?.();
          },
          style: "destructive",
        },
      ],
      { cancelable: false }
    );
  };

  const deleteMessage = () => {
    if (view) {
      showAlert();
    } else {
      resetModal();
    }
  };

  return (
    <View style={styles.contentContainer}>
      <VideoView
        style={styles.video}
        player={player}
        // allowsFullscreen
        // allowsPictureInPicture
        contentFit="contain"
      />
      <View style={styles.controls}>
        <TouchableOpacity onPress={deleteMessage}>
          <TrashIcon color="white" size={30} />
        </TouchableOpacity>
        <TouchableOpacity
          disabled={loading}
          onPress={() => (isPlaying ? player.pause() : player.play())}
        >
          {isPlaying ? (
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
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "black",
  },
  video: {
    width: "100%",
    height: "85%",
    // flex: 1
  },
  controls: {
    width: '100%',
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
