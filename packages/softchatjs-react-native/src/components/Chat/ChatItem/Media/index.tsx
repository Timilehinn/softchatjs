import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { MediaType, Message } from "softchatjs-core";
import { useModalProvider } from "../../../../contexts/ModalProvider";
import ImagePreview from "../../../Modals/ImagePreview";
import VoiceMessage from "./VoiceMessage";
import { useConfig } from "../../../../contexts/ChatProvider";
import { Image } from "expo-image";
import VideoPlayer from "./Video";

type Props = {
  message: Message;
  isPending?: boolean;
  recipientId: string;
  position?: "left" | "right"
};

export default function MediaMessage(props: Props) {
  const { message, isPending, recipientId, position } = props;

  const { theme } = useConfig();

  const { displayModal } = useModalProvider();

  return (
    <View style={{ marginTop: message?.message ? 3 : 0 }}>
      {message.attachedMedia.map((media, i) => {
        if (media.type === MediaType.IMAGE) {
          return (
            <TouchableOpacity
              onPress={() =>
                displayModal({
                  justifyContent: "flex-start",
                  children: (
                    <ImagePreview
                      viewOnly
                      clearActiveQuote={() => {}}
                      activeQuote={null}
                      chatUserId={""}
                      recipientId={""}
                      image={media}
                    />
                  ),
                })
              }
              key={i}
              activeOpacity={0.7}
              style={{ padding: 2, borderRadius: 16.5, backgroundColor: position === "right"? theme.chatBubble.right.bgColor : theme.chatBubble.left.bgColor }}
            >
              <Image
                placeholder={require("../../../../assets/img_placeholder.png")}
                placeholderContentFit="cover"
                source={{ uri: isPending ? media.mediaUrl : media.mediaUrl }}
                style={{
                  height: 200,
                  width: 250,
                  borderRadius: 15,
                  // marginBottom: 10,
                }}
                cachePolicy="disk"
                contentFit="cover"
              />
            </TouchableOpacity>
          );
        } else if (media.type === MediaType.AUDIO) {
          return (
            <View key={i} style={{ marginBottom: 5 }}>
              <VoiceMessage media={media} textColor={theme?.text.secondary} />
            </View>
          );
        } else if (media.type === MediaType.VIDEO) {
          return (
            <VideoPlayer
              key={i}
              media={media}
              message={message}
              recipientId={recipientId}
              position={position}
            />
          );
        }
      })}
    </View>
  );
}
