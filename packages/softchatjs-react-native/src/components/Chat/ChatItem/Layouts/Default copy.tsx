import { View, Text, ViewStyle, Linking } from "react-native";
import React, { useCallback, useMemo } from "react";
import Animated from "react-native-reanimated";
import {
  AttachmentTypes,
  ChatBubbleRenderProps,
  ConversationType,
  Message,
} from "softchatjs-expo/src/types";
import MessageAvatar from "../../MessageAvatar";
import Quoted from "../Quoted";
import Sticker from "../Sticker";
import { formatMessageTime } from "softchatjs-expo/src/utils";
import Reactions from "../Reactions";
import { useConfig } from "softchatjs-expo/src/contexts/ChatProvider";
import Preview from "../Preview";
import MediaMessage from "../Media";

type DefaultProps = {
  message: Message;
  animatedStyles: ViewStyle;
  position: "left" | "right";
  conversationType: ConversationType;
  renderStateIcon: (color: string) => JSX.Element;
  chatUserId: string;
  recipientId: string;
  renderChatBubble?: (props: ChatBubbleRenderProps) => void;
  onScrollToIndex: (messageId: string) => void;
};

export default function Default(props: DefaultProps) {
  const {
    message,
    animatedStyles,
    position,
    conversationType,
    renderStateIcon,
    chatUserId,
    recipientId,
    renderChatBubble,
    onScrollToIndex,
  } = props;

  const { theme } = useConfig();

  let rightStyle: ViewStyle = {
    borderBottomRightRadius: 3,
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    alignItems: "flex-end",
    backgroundColor: theme?.chatBubble.right.bgColor
  };

  let leftStyle: ViewStyle = {
    borderBottomLeftRadius: 3,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    alignItems: "flex-start",
    backgroundColor: theme?.chatBubble.left.bgColor
  };

  const renderAvatar = () => {
    if (position === "left" && conversationType === "group-chat") {
      return (
        <MessageAvatar
          size={50}
          initials="TG"
          imgUrl=""
          style={{ marginEnd: 5 }}
        />
      );
    }
  };

  const RenderAttachment = useCallback(() => {
    switch (message.attachmentType) {
      case AttachmentTypes.STICKER:
        return <Sticker message={message} />;
      case AttachmentTypes.MEDIA:
        return <MediaMessage message={message} />;
      default:
        return <></>;
    }
  }, [message]);

  const hasTextMessage = useMemo(() => {
    return message.message.length > 0;
  }, [message.message]);

  const renderMessageWithLinks = (message: string) => {
    if (!message) return null;
  
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
  
    const parts = message.split(urlRegex);
  
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <Text
            key={index}
            style={{ textDecorationLine: 'underline', textTransform: 'lowercase' }}
            onPress={() => Linking.openURL(part)}
          >
            {part}
          </Text>
        );
      } else {
        return <Text key={index}>{part}</Text>;
      }
    });
  };

  return (
    <Animated.View
      style={[
        animatedStyles,
        {
          flexDirection: "row",
          width: "100%",
          justifyContent: position === "left" ? "flex-start" : "flex-end",
        },
        message.reactions.length > 0 && { marginBottom: 15 },
        position === "left" ? { paddingLeft: 10 } : { paddingRight: 10 },
      ]}
    >
      {conversationType === "group-chat" && !renderChatBubble && (
        <>{renderAvatar()}</>
      )}
      <>
        {renderChatBubble ? (
          renderChatBubble({ message })
        ) : (
          <View
            style={[
              { maxWidth: "80%", padding: 10, borderRadius: 10 },
              position === "left" ? leftStyle : rightStyle,
            ]}
          >
            <Quoted
              quotedMessage={message.quotedMessage}
              onPress={() => onScrollToIndex(message.quotedMessage?.messageId)}
              theme={theme}
            />
            {conversationType === "group-chat" && position === "left" && (
              <Text style={[{ color: "red" }]}>
                {message.messageOwner.username}
              </Text>
            )}
            <RenderAttachment />
            {hasTextMessage && (
              <View style={{ flex: 1 }}>
                <Preview message={message.message} color={position === "left"
                        ? theme?.chatBubble.left.messageColor
                        : theme?.chatBubble.right.messageColor} />
                <Text
                  style={{
                    color:
                      position === "left"
                        ? theme?.chatBubble.left.messageColor
                        : theme?.chatBubble.right.messageColor,
                    fontSize: 17,
                  }}
                >
                  {renderMessageWithLinks(message?.message)}
                </Text>
              </View>
            )}
            <View
              style={[
                {
                  flexDirection: "row",
                  alignItems: "center",
                  width: "auto",
                  marginTop: 3,
                },
                position === "left"
                  ? { alignSelf: "flex-start" }
                  : { alignSelf: "flex-end" },
              ]}
            >
              <Text
                style={{
                  fontSize: 11,
                  color:
                      position === "left"
                        ? theme?.chatBubble.left.messageTimeColor
                        : theme?.chatBubble.right.messageTimeColor,
                }}
              >
                {formatMessageTime(message.createdAt)}
              </Text>
              {position === "right" && <>{renderStateIcon("black")}</>}
            </View>
            {message.lastEdited && (
              <Text
                style={{
                  fontSize: 11,
                  fontStyle: "italic",
                  color: theme?.text.disabled,
                }}
              >
                (edited)
              </Text>
            )}
            <Reactions
              reactions={message.reactions}
              position={position}
              conversationId={message.conversationId}
              messageId={message.messageId}
              chatUserId={chatUserId}
              recipientId={recipientId}
            />
          </View>
        )}
      </>
    </Animated.View>
  );
}
