import React from 'react'
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
  ChatTheme,
  Conversation,
  MediaType,
  Message,
  UserMeta,
} from "../../../types";
import { useCallback, useMemo, useState } from "react";
import Sticker from "./Sticker";
import MessageAvatar from "../MessageAvatar";
import { convertToMinutes, truncate } from "../../../utils";
import { useConfig } from "../../../contexts/ChatProvider";
import { MicIcon, ReplyIcon } from "../../../assets/icons";
import Preview from "./Preview";

type QuotedProps = {
  quotedMessage: Message | null;
  onPress: () => void;
  layout?: "stacked";
  theme?: ChatTheme;
  position?: "left" | "right";
  chatUserId?: string
};

export default function Quoted(props: QuotedProps) {
  const { quotedMessage, layout, onPress, theme, position, chatUserId } = props;

  if (!quotedMessage) {
    return null;
  }

  const RenderQuotedMessagePreview = useCallback(() => {
    switch (quotedMessage.attachmentType) {
      case AttachmentTypes.STICKER:
        return (
          <View style={{ padding: 3, borderWidth: 1, borderRadius: 3 }}>
            <Text
              style={{
                color: theme?.text.secondary,
                fontSize: 10,
                fontWeight: "bold",
              }}
            >
              {quotedMessage.attachmentType}
            </Text>
          </View>
        );
      case AttachmentTypes.MEDIA:
        return (
          <View style={{ padding: 3, borderWidth: 1, borderRadius: 3 }}>
            <Text
              style={{
                color: theme?.text.secondary,
                fontSize: 10,
                fontWeight: "bold",
              }}
            >
              {quotedMessage.attachmentType}
            </Text>
          </View>
        );
      default:
        return (
          <View style={{ padding: 3, borderWidth: 1, borderRadius: 3 }}>
            <Text
              style={{
                color: theme?.text.secondary,
                fontSize: 10,
                fontWeight: "bold",
              }}
            >
              media
            </Text>
          </View>
        );
    }
  }, []);

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
            <Text style={{ flex: 1, color: theme?.text.disabled }}>
              {truncate(quotedMessage?.message, 100)}
            </Text>
          ) : (
            <RenderQuotedMessagePreview />
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

  const renderMediaIcon = useCallback(() => {
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
              <MicIcon size={20} color={'white'} />
              <Text
                style={{
                  color: 'white',
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
  }, [quotedMessage]);

  return (
    <TouchableOpacity
      onPress={() => onPress?.()}
      style={[
        {
          backgroundColor: "rgba(0,0,0,.3)",
          padding: 5,
          borderRadius: 5,
          width: "100%",
          marginBottom: 5,
          borderLeftWidth: 4,
          borderColor:
            // position === "right"
              // ? theme?.chatBubble.right.replyBorderColor
              // : theme?.chatBubble.left.replyBorderColor,
              quotedMessage.messageOwner.color
        },
      ]}
    >
      <Text style={{ color: quotedMessage.messageOwner.color, textTransform: 'capitalize', marginBottom: 5, fontWeight: 'bold',  textShadowColor: 'rgba(0, 0, 0, 0.3)',
  textShadowOffset: { width: .5, height: .5 },
  textShadowRadius: 5, }}>{quotedMessage.messageOwner.uid === chatUserId? "You" : quotedMessage.messageOwner.username}</Text>
      <>{renderMediaIcon()}</>
      <Preview
        message={quotedMessage.message}
        color={
          position === "left"
            ? (theme?.chatBubble.left.messageColor as string)
            : (theme?.chatBubble.right.messageColor as string)
        }
      />

      <Text
        style={{
          display: quotedMessage.message ? "flex" : "none",
          color: "white",
          fontSize: 14,
        }}
      >
        {quotedMessage.message}
      </Text>
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
