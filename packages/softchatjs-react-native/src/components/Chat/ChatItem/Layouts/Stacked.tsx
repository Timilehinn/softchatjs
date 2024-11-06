import { View, Text, ViewStyle, TouchableOpacity, Linking } from "react-native";
import React, { useCallback, useMemo } from "react";
import {
  AttachmentTypes,
  ChatBubbleRenderProps,
  Message,
  MessageStates,
} from "../../../../types";
import MessageAvatar from "../../MessageAvatar";
import Sticker from "../Sticker";
import Animated from "react-native-reanimated";
import { formatMessageTime, truncate } from "../../../../utils";
import Reactions from "../Reactions";
import Quoted from "../Quoted";
import { useConfig } from "../../../../contexts/ChatProvider";
import Preview from "../Preview";
import MediaMessage from "../Media";

type StackedProps = {
  message: Message;
  animatedStyles: ViewStyle;
  renderStateIcon: (color: string) => JSX.Element;
  chatUserId: string;
  recipientId: string;
  myMessage: boolean;
  renderChatBubble?: (props: ChatBubbleRenderProps) => void;
  onScrollToIndex: (messageId: string) => void;
  isPending?: boolean;
  retryUpload: () => void;
};

export default function Stacked(props: StackedProps) {
  const { theme } = useConfig();
  const {
    message,
    animatedStyles,
    renderStateIcon,
    chatUserId,
    recipientId,
    renderChatBubble,
    myMessage,
    onScrollToIndex,
    isPending,
    retryUpload
  } = props;

  const RenderAttachment = useCallback(() => {
    switch (message.attachmentType) {
      case AttachmentTypes.STICKER:
        return <Sticker message={message} />;
      case AttachmentTypes.MEDIA:
        return <MediaMessage message={message} isPending={isPending} recipientId={recipientId} />;
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
            style={{
              textDecorationLine: "underline",
              textTransform: "lowercase",
            }}
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
        isPending ? { opacity: 0.7 } : animatedStyles,
        {
          paddingVertical: 10,
          paddingHorizontal: 10,
          flex: 1,
          borderBottomWidth: 0,
          borderColor: theme?.divider,
          // backgroundColor: theme?.background.primary
        },
      ]}
    >
      {message.quotedMessage && (
        <Quoted
          onPress={() =>
            onScrollToIndex(message.quotedMessage?.messageId as string)
          }
          quotedMessage={message.quotedMessage}
          layout="stacked"
          theme={theme}
        />
      )}
      <>
        {renderChatBubble ? (
          renderChatBubble({ message })
        ) : (
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              width: "100%",
              flex: 1,
            }}
          >
            <MessageAvatar
              size={45}
              initials={message.messageOwner?.username.substring(0, 2)}
              imgUrl={message.messageOwner?.profileUrl}
              style={{
                marginEnd: 5,
                backgroundColor: message.messageOwner?.color,
              }}
            />

            <View style={{ flex: 1, paddingHorizontal: 10, width: "100%" }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 5,
                }}
              >
                <Text style={[{ color: theme?.text.secondary }]}>
                  {message.messageOwner?.username}
                </Text>
                <Text
                  style={[
                    {
                      color: theme?.text.disabled,
                      marginStart: 10,
                      fontSize: 9,
                      marginEnd: 5,
                    },
                  ]}
                >
                  {formatMessageTime(message.createdAt)}
                </Text>
                {myMessage && <>{renderStateIcon(theme?.icon as string)}</>}
              </View>

              <RenderAttachment />
              {hasTextMessage && (
                <View style={{ flex: 1, marginBottom: 10 }}>
                  <Preview
                    message={message.message}
                    color={theme?.text.secondary as string}
                  />
                  <Text
                    style={{
                      color: theme?.text.secondary,
                      fontSize: 17,
                    }}
                  >
                    {renderMessageWithLinks(message.message || "")}{" "}
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
                  </Text>
                </View>
              )}
            {isPending === true && message.messageState !== MessageStates.FAILED && (
              <Text
                style={[
                  {
                    color: theme?.text.disabled,
                    fontSize: 11,
                    marginTop: 5,
                    fontStyle: "italic",
                    marginStart: 15
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
                  {
                    color: 'tomato',
                    fontSize: 11,
                    marginTop: 5,
                    fontStyle: "italic",
                    marginStart: 15
                  },
                ]}
              >
                Upload failed
              </Text>
            )}
       
              <Reactions
                layout="stacked"
                reactions={message.reactions}
                position={"left"}
                conversationId={message.conversationId}
                messageId={message.messageId}
                chatUserId={chatUserId}
                recipientId={recipientId}
              />
            </View>
          </View>
        )}
      </>
    </Animated.View>
  );
}
