import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Text,
  ViewStyle,
} from "react-native";
import {
  AttachmentTypes,
  Conversation,
  MediaType,
  Message,
  UserMeta,
} from "softchatjs-core";
import { ChatTheme } from "../../../types";
import { useCallback } from "react";
import Sticker from "./Sticker";
import MessageAvatar from "../MessageAvatar";
import { convertToMinutes, truncate } from "../../../utils";
import { useConfig } from "../../../contexts/ChatProvider";
import { MicIcon } from "../../../assets/icons";
import Preview from "./Preview";

type QuotedProps = {
  quotedMessage: Message | null;
  onPress: () => void;
  layout?: "stacked";
  theme?: ChatTheme;
  position?: "left" | "right";
  chatUserId?: string;
};

export default function Quoted(props: QuotedProps) {
  const { quotedMessage, layout, onPress, theme, position, chatUserId } = props;
  const { fontFamily } = useConfig();

  if (!quotedMessage) {
    return null;
  }

  // const RenderQuotedMessagePreview = useCallback(() => {
  //   switch (quotedMessage.attachmentType) {
  //     case AttachmentTypes.STICKER:
  //       return (
  //         <View style={{ padding: 3, borderWidth: 1, borderRadius: 3 }}>
  //           <Text
  //             style={{
  //               color: theme?.text.secondary,
  //               fontSize: 10,
  //               fontFamily,
  //             }}
  //           >
  //             {quotedMessage.attachmentType}
  //           </Text>
  //         </View>
  //       );
  //     case AttachmentTypes.MEDIA:
  //       return (
  //         <View style={{ padding: 3, borderWidth: 1, borderRadius: 3 }}>
  //           <Text
  //             style={{
  //               color: theme?.text.secondary,
  //               fontSize: 10,
  //               fontFamily
  //             }}
  //           >
  //             {quotedMessage.attachmentType}
  //           </Text>
  //         </View>
  //       );
  //     default:
  //       return (
  //         <View style={{ padding: 3, borderWidth: 1, borderRadius: 3 }}>
  //           <Text
  //             style={{
  //               color: theme?.text.secondary,
  //               fontSize: 10,
  //               fontFamily
  //             }}
  //           >
  //             media
  //           </Text>
  //         </View>
  //       );
  //   }
  // }, []);
  const renderMediaPreview = () => {
    switch (quotedMessage.attachmentType) {
      case AttachmentTypes.STICKER:
        return <Sticker message={quotedMessage} />;
      case AttachmentTypes.MEDIA:
        var mediaType = quotedMessage.attachedMedia[0]?.type;
        if (mediaType === MediaType.IMAGE) {
          return <Sticker message={quotedMessage} />;
        } else if (mediaType === MediaType.AUDIO) {
          return (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MicIcon size={20} color={"white"} />
              <Text
                style={{
                  color: "white",
                  marginStart: 5,
                }}
              >
                {convertToMinutes(
                  quotedMessage.attachedMedia[0]?.meta?.audioDurationSec ?? 0
                )}
              </Text>
            </View>
          );
        }
    }
  };

  if (layout === "stacked") {
    return (
      <TouchableOpacity
        onPress={() => onPress?.()}
        style={{ flexDirection: "row", alignItems: "center" }}
      >
        <View
          style={{
            height: "70%",
            width: "100%",
            flex: 1,
            borderLeftWidth: 2,
            borderTopWidth: 2,
            borderTopLeftRadius: 10,
            marginStart: 22,
            borderColor: theme?.divider,
          }}
        />
        <View
          style={{
            width: "85%",
            top: -8,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <MessageAvatar
            size={20}
            initials={quotedMessage?.messageOwner?.username.substring(0, 2)}
            imgUrl={quotedMessage.messageOwner.profileUrl}
            style={{
              marginEnd: 5,
              backgroundColor: quotedMessage.messageOwner.color,
            }}
          />
          {quotedMessage.message ? (
            <Text style={{ flex: 1, color: theme?.text.disabled, fontFamily }}>
              {truncate(quotedMessage?.message, 100)}
            </Text>
          ) : (
            <>{renderMediaPreview()}</>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  let rightStyle: ViewStyle = {
    borderRadius: 10,
    alignItems: "flex-end",
    padding: 8,
    backgroundColor: theme?.chatBubble.right.bgColor,
  };

  let leftStyle: ViewStyle = {
    padding: 8,
    borderRadius: 10,
    alignItems: "flex-start",
    backgroundColor: theme?.chatBubble.left.bgColor,
  };

  // var replyingTo = (messageOwner: UserMeta) => {
  //   return chatUserId === messageOwner.uid? `You replied to ${messageOwner.username}` : `${messageOwner.username} replied to you.`
  // }

  return (
    <TouchableOpacity
      onPress={() => onPress?.()}
      style={[
        {
          backgroundColor: "rgba(0,0,0,.3)",
          padding: 8,
          borderTopRightRadius: 15,
          borderTopLeftRadius: 15,
          borderLeftWidth: 4,
          borderTopWidth: 4,
          borderTopColor: 'transparent',
          borderLeftColor: quotedMessage.messageOwner.color,
        },
      ]}
    >
      <Text
        style={{
          color: quotedMessage.messageOwner.color,
          textTransform: "capitalize",
          fontFamily,
          marginBottom: 5,
          textShadowColor: "rgba(0, 0, 0, 0.3)",
          textShadowOffset: { width: 0.5, height: 0.5 },
          textShadowRadius: 5,
        }}
      >
        {quotedMessage.messageOwner.uid === chatUserId
          ? "You"
          : quotedMessage.messageOwner.username}
      </Text>
      <>{renderMediaPreview()}</>
      <Preview
        message={quotedMessage.message}
        color={
          position === "left"
            ? (theme?.chatBubble.left.messageColor as string)
            : (theme?.chatBubble.right.messageColor as string)
        }
      />
      {quotedMessage.message && (
        <Text
          style={{
            display: quotedMessage.message ? "flex" : "none",
            fontFamily,
            color: "white",
            fontSize: 14,
            marginTop: 5
          }}
        >
          {quotedMessage.message}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  main: {
    padding: 5,
    borderLeftWidth: 2,
    marginBottom: 5,
  },
});
