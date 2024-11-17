import { View, Text, ViewStyle, Linking, TouchableOpacity } from "react-native";
import React, { useCallback, useMemo } from "react";
import Animated from "react-native-reanimated";
import { ChatBubbleRenderProps } from "../../../../types";
import {
  AttachmentTypes,
  ConversationType,
  Message,
  MessageStates,
  UserMeta,
} from "softchatjs-core";
import MessageAvatar from "../../MessageAvatar";
import Quoted from "../Quoted";
import Sticker from "../Sticker";
import { formatMessageTime } from "../../../../utils";
import Reactions from "../Reactions";
import { useConfig } from "../../../../contexts/ChatProvider";
import Preview from "../Preview";
import MediaMessage from "../Media";
import { BroadcastIcon } from "../../../../assets/icons";

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
  isPending?: boolean;
  threaded?: boolean;
  retryUpload: () => void;
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
    isPending,
    threaded = false,
    retryUpload,
  } = props;

  const { theme, fontFamily } = useConfig();

  const getStyle = useMemo(() => {
    if (position === "right") {
      return {
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        backgroundColor: theme?.chatBubble.right.bgColor,
      };
    }
    return {
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      borderBottomRightRadius: 10,
      backgroundColor: theme?.chatBubble.left.bgColor,
    };
  }, [threaded, position]);

  const RenderAttachment = useCallback(
    ({ isQuote }: { isQuote?: boolean }) => {
      var data =
        isQuote === true ? (message.quotedMessage as Message) : message;
      switch (data.attachmentType) {
        case AttachmentTypes.STICKER:
          return <Sticker message={data} />;
        case AttachmentTypes.MEDIA:
          return (
            <MediaMessage
              message={data}
              isPending={isPending}
              recipientId={recipientId}
            />
          );
        default:
          return <></>;
      }
    },
    [message]
  );

  const hasTextMessage = useMemo(() => {
    return message.message.length > 0;
  }, [message]);

  const renderMessageWithLinks = (message: string) => {
    if (!message) return null;

    const urlRegex = /(https?:\/\/[^\s]+)/gi;

    const parts = message.split(urlRegex);

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <Text
            key={index}
            style={{
              textDecorationLine: "underline",
              textTransform: "lowercase",
              fontFamily,
            }}
            onPress={() => Linking.openURL(part)}
          >
            {part}
          </Text>
        );
      } else {
        return (
          <Text style={{ fontFamily }} key={index}>
            {part}
          </Text>
        );
      }
    });
  };

  return (
    <View
      style={[
        isPending ? { opacity: 0.7 } : animatedStyles,
        {
          maxWidth: "80%",
          alignItems: position === "right" ? "flex-end" : "flex-start",
          alignSelf: position === "left" ? "flex-start" : "flex-end",
        },
        message.reactions.length > 0 && { marginBottom: 15 },
        position === "left" ? { paddingLeft: 10 } : { paddingRight: 10 },
      ]}
    >
      <View
        style={{
          flexDirection: position === "right" ? "row" : "row-reverse",
          alignItems: "flex-end",
        }}
      >
        <View style={[getStyle, { padding: 8 }]}>
          <Quoted
            chatUserId={chatUserId}
            quotedMessage={message.quotedMessage}
            onPress={() =>
              onScrollToIndex(message.quotedMessage?.messageId as string)
            }
            theme={theme}
            position={position}
          />
            <RenderAttachment />
            {hasTextMessage && (
              <Preview
                message={message.message}
                color={
                  position === "left"
                    ? (theme?.chatBubble.left.messageColor as string)
                    : (theme?.chatBubble.right.messageColor as string)
                }
              />
            )}
            {hasTextMessage && (
              <Text
                style={{
                  fontFamily,
                  // fontSize: 17,
                  color:
                    position === "left"
                      ? theme?.chatBubble.left.messageColor
                      : theme?.chatBubble.right.messageColor,
                }}
              >
                {renderMessageWithLinks(message?.message)}
              </Text>
            )}
          <View
            style={[
              {
                flexDirection: "row",
                alignItems: "center",
              },
              { justifyContent: "flex-end" },
              position === "left" && {
                paddingRight: 5,
              },
            ]}
          >
            {message.isBroadcast && (
              <BroadcastIcon
                color={
                  position === "right"
                    ? theme.chatBubble.right.messageColor
                    : theme.chatBubble.left.messageColor
                }
                size={13}
              />
            )}
            <Text
              style={{
                fontFamily,
                fontSize: 11,
                marginTop: 3,
                color:
                  position === "left"
                    ? theme?.chatBubble.left.messageTimeColor
                    : theme?.chatBubble.right.messageTimeColor,
              }}
            >
              <Text style={{ fontStyle: "italic", fontFamily }}>
                {message.lastEdited && "(Edited)"}{" "}
              </Text>
              {formatMessageTime(message.createdAt)}
            </Text>

            {position === "right" && (
              <>
                {renderStateIcon(
                  theme?.chatBubble.right.messageTimeColor as string
                )}
              </>
            )}
          </View>
        </View>
      </View>
      <Reactions
        reactions={message.reactions}
        position={position}
        conversationId={message.conversationId}
        messageId={message.messageId}
        chatUserId={chatUserId}
        recipientId={recipientId}
      />
      {isPending === true && message.messageState !== MessageStates.FAILED && (
        <Text
          style={[
            position == "right" && { marginEnd: 15 },
            position == "left" && { marginStart: 15 },
            {
              fontFamily,
              color: theme?.text.disabled,
              fontSize: 11,
              marginTop: 5,
              fontStyle: "italic",
            },
          ]}
        >
          Uploading...
        </Text>
      )}
      {isPending === true && message.messageState === MessageStates.FAILED && (
        <Text
          onPress={retryUpload}
          style={[
            position == "right" && { marginEnd: 15 },
            position == "left" && { marginStart: 15 },
            {
              fontFamily,
              color: "tomato",
              fontSize: 11,
              marginTop: 5,
              fontStyle: "italic",
            },
          ]}
        >
          Upload failed
        </Text>
      )}
    </View>
  );
}
