import { View, Text, ViewStyle, Linking, TouchableOpacity } from "react-native";
import React, { useCallback, useMemo } from "react";
import Animated from "react-native-reanimated";
import {
  AttachmentTypes,
  ChatBubbleRenderProps,
  ConversationType,
  Message,
  MessageStates,
  UserMeta,
} from "../../../../types";
import MessageAvatar from "../../MessageAvatar";
import Quoted from "../Quoted";
import Sticker from "../Sticker";
import { formatMessageTime } from "../../../../utils";
import Reactions from "../Reactions";
import { useConfig } from "../../../../contexts/ChatProvider";
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
    retryUpload
  } = props;

  const { theme } = useConfig();

  const getStyle = useMemo(() => {
    // if(threaded) {
    //   return {
    //     borderRadius: 10,
    //     backgroundColor: position === "left" ? theme?.chatBubble.left.bgColor : theme?.chatBubble.right.bgColor,
    //   }
    // }
    if(position === "right"){
      return {
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        backgroundColor: theme?.chatBubble.right.bgColor,
      }
    }
    return {
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      borderBottomRightRadius: 10,
      backgroundColor: theme?.chatBubble.left.bgColor,
    }
  },[threaded, position])

  let rightStyle: ViewStyle = {
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    backgroundColor: theme?.chatBubble.right.bgColor,
  };

  let leftStyle: ViewStyle = {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: theme?.chatBubble.left.bgColor,
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

  const RenderAttachment = useCallback(
    ({ isQuote }: { isQuote?: boolean }) => {
      var data =
        isQuote === true ? (message.quotedMessage as Message) : message;
      switch (data.attachmentType) {
        case AttachmentTypes.STICKER:
          return <Sticker message={data} />;
        case AttachmentTypes.MEDIA:
          return <MediaMessage message={data} isPending={isPending} recipientId={recipientId} />;
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

  var replyingTo = (messageOwner: UserMeta) => {
    return chatUserId === messageOwner.uid
      ? `You replied to ${messageOwner.username}`
      : `${messageOwner.username} replied to you.`;
  };

  return (
    <Animated.View
      style={[
        isPending ? { opacity: 0.7 } : animatedStyles,
        {
          maxWidth: "90%",
          // marginBottom: 8,
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
            onPress={() => onScrollToIndex(message.quotedMessage?.messageId as string)}
            theme={theme}
            position={position}
          />
          <View style={{ width: "100%", flex: 1, paddingHorizontal: 0 }}>
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
                  fontSize: 17,
                  color:
                    position === "left"
                      ? theme?.chatBubble.left.messageColor
                      : theme?.chatBubble.right.messageColor,
                }}
              >
                {renderMessageWithLinks(message?.message)}
              </Text>
            )}
          </View>
          <View
            style={[
              {
                flexDirection: "row",
                alignItems: "center",
                minWidth: 120,
                marginTop: message.message.length > 7? 2 : -5
              },
              { justifyContent: "flex-end" },
              position === "left" && {
                paddingRight: 5
              }
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
              <Text style={{ fontStyle: 'italic' }}>
              {message.lastEdited && "Edited"}{" "}
              </Text>
              {formatMessageTime(message.createdAt)}
            </Text>
            {position === "right" && (
              <>{renderStateIcon(theme?.chatBubble.right.messageTimeColor as string)}</>
            )}
          </View>
        </View>
        {/* {threaded ?(

         <View style={{ width: 15 }} /> 

        ):(
          <View
          style={{
            height: 25,
            width: 15,
            transform: [{ rotateY: position === "right" ? "0deg" : "180deg" }],
            backgroundColor:
              position === "right"
                ? theme?.chatBubble.right.bgColor
                : theme?.chatBubble.left.bgColor,
          }}
         >
          <View
            style={{
              borderBottomLeftRadius: 25,
              backgroundColor: theme?.background.primary,
              height: "100%",
              width: "100%",
            }}
          />
         </View>
        )}
        */}
      </View>
      {/* <View
        style={[
          position === "right" && { marginEnd: 15 },
          position === "left" && { marginStart: 15 },
        ]}
      > */}
        <Reactions
          reactions={message.reactions}
          position={position}
          conversationId={message.conversationId}
          messageId={message.messageId}
          chatUserId={chatUserId}
          recipientId={recipientId}
        />
      {/* </View> */}

      {isPending === true && message.messageState !== MessageStates.FAILED && (
        <Text
          style={[
            position == "right" && { marginEnd: 15 },
            position == "left" && { marginStart: 15 },
            {
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
              color: 'tomato',
              fontSize: 11,
              marginTop: 5,
              fontStyle: "italic",
            },
          ]}
        >
          Upload failed
        </Text>
      )}
    </Animated.View>
  );
}
