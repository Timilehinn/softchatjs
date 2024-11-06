import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useMemo, useRef, useState } from "react";
import { AttachmentTypes, Media, MediaType, Message, MessageStates } from "../../types";
import {
  generateConversationId,
  generateFillerTimestamps,
  generateId,
} from "softchatjs-core";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import ChatInput from "../Chat/ChatInput";
import { XIcon } from "../../assets/icons";
import { useModalProvider } from "../../contexts/ModalProvider";
import { UPLOAD_MEDIA } from "../../api";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { useConfig } from "../../contexts/ChatProvider";
import { useMessageState } from "../../contexts/MessageStateContext";
import { Image } from "expo-image";

type ImagePreviewProps = {
  image: (Media & { base64?: string | undefined }) | null;
  chatUserId: string;
  recipientId: string;
  activeQuote: Message | null;
  clearActiveQuote: () => void;
  viewOnly?: boolean,
  conversationId?: string | undefined
};

const { width, height } = Dimensions.get('screen');

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

export default function ImagePreview(props: ImagePreviewProps) {
  const inputRef = useRef<TextInput>(null);

  const { image, chatUserId, recipientId, activeQuote, clearActiveQuote, viewOnly = false, conversationId } =
    props;
  const { addNewPendingMessages } = useMessageState();
  const { resetModal } = useModalProvider();
  const { client } = useConfig()
  const {
    globalTextMessage,
    setGlobalTextMessage
  } = useMessageState();
  const [ message, setMessage ] = useState(globalTextMessage)

  const screenWidth = width
  const screenHeight = height;
  const [ uploading, showUploading ] = useState(false);

  const scale = useSharedValue(1);
  const startScale = useSharedValue(0);
    
    const animatedStyles = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const pinch = Gesture.Pinch()
    .onStart(() => {
      startScale.value = scale.value;
    })
    .onUpdate((event) => {
      scale.value = clamp(
        startScale.value * event.scale,
        0.5,
        Math.min(width / 100, height / 100)
      );
    })
    .runOnJS(true);

  const sendMessage = async (mediaUrl: string) => {
    try {
      if(client && conversationId){
        var timeStamps = generateFillerTimestamps();
        // const conversationId = generateConversationId(chatUserId, recipientId);
        const messageId = generateId();
  
        const newMessage: Message = {
          conversationId,
          from: chatUserId as string,
          to: recipientId,
          message: message,
          messageState: MessageStates.LOADING,
          quotedMessageId: activeQuote?.messageId || "",
          quotedMessage: activeQuote,
          messageId,
          reactions: [],
          attachedMedia: [{
            type: MediaType.IMAGE,
            ext: '.png',
            mediaId: generateId(),
            mediaUrl: mediaUrl,
            meta: {
              aspectRatio: image?.meta?.aspectRatio,
              height: image?.meta?.height,
              width: image?.meta?.width,
              size: image?.meta?.size
            }
          }],
          lastEdited: null,
          attachmentType: AttachmentTypes.MEDIA,
          ...timeStamps,
          messageOwner: {
            // uid: chatUserId,
            ...client.userMeta,
            ...timeStamps,
          },
        };
        if(client){
          client.messageClient(conversationId).sendMessage(newMessage)
        }
        setGlobalTextMessage("");
        setMessage("")
        console.log("sending -2");
        if (activeQuote?.message) {
          clearActiveQuote();
        }
      }else{
        console.log('no client connection yet')
      }
      
    } catch (err) {
      console.log(err);
    }
  };

  const uploadImage = async () => {
    // try {
    //   if(image?.base64 && wsAccessConfig.token){
    //     showUploading(true)
    //     const res = await UPLOAD_MEDIA<{ url: string }>(wsAccessConfig.token, { base64: image.base64, key: generateId(), conversationId: generateConversationId(chatUserId, recipientId) });
    //    console.log(res)
    //     if(res.success && res.data.url){
    //       sendMessage(res.data.url)
    //       resetModal()
    //     }else{
    //       throw new Error('Unable to upload image, please retry')
    //     }
    //   }else{
    //     throw new Error('Unable to upload image, please retry')
    //   }
    // } catch (error) {
    //   if(error instanceof Error){
    //     console.error(error.message)
    //   }
    // } finally {
    //   showUploading(false)
    // }
    try {
      // if(client){
      //   if(image?.base64){
      //     showUploading(true);
      //     let conversationId = generateConversationId(chatUserId, recipientId)
      //     const res = await client.messageClient(conversationId).uploadAttachment({ base64: image.base64, fileKey: generateId() })
      //     console.log(res)
      //     if(res && res.data.url){
      //       sendMessage(res.data.url)
      //       resetModal()
      //     }else{
      //       throw new Error('Unable to upload image, please retry')
      //     }
      //   }else{
      //     throw new Error('Unable to upload image, please retry')
      //   }
      // }
        if(client && image?.base64){
        var timeStamps = generateFillerTimestamps();

      addNewPendingMessages(
        {
            from: chatUserId,
            messageId: generateId(),
            conversationId,
            to: recipientId,
            message,
            reactions: [],
            attachedMedia: [
              {
                uploading: true,
                type: MediaType.IMAGE,
                mimeType: image.mimeType,
                ext: '.png',
                mediaId: generateId(),
                mediaUrl: image.base64,
                meta: {
                  aspectRatio: image?.meta?.aspectRatio,
                  height: image?.meta?.height,
                  width: image?.meta?.width,
                  size: image?.meta?.size
                }
              }
            ],
            messageOwner: {
              ...client?.userMeta,
              ...timeStamps,
            },
            attachmentType: AttachmentTypes.MEDIA,
            quotedMessage: null,
            quotedMessageId: activeQuote?.messageId || "",
            createdAt: new Date()
          }
      );
      if (activeQuote?.message) {
        clearActiveQuote();
      }
      resetModal();
     
    }

    } catch (error) {
      if(error instanceof Error){
        console.error(error.message)
      }
    } finally {
      showUploading(false)
    }
  }

  const url = useMemo(() => {
    // if(viewOnly) return image?.mediaUrl
    // return "data:image/jpeg;base64," + image?.base64
    return image?.mediaUrl
  },[image])

  return (
    <GestureHandlerRootView>
    <View
      style={{
        flex: 1,
        backgroundColor: "black",
        height: "100%",
        width: "100%",
        paddingBottom: Platform.OS === "android" ? 0 : 20,
      }}
    >
                <TouchableOpacity
                  onPress={() => resetModal(() => {})}
                  style={{
                    zIndex: 999,
                    top: Platform.OS === 'ios'? 50 : 20,
                    right: 15,
                    position: "absolute",
                    alignSelf: "flex-end",
                  }}
                >
                  <XIcon size={30} color="white" />
                </TouchableOpacity>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View
          style={{
            flex: 1,
              height: "100%",
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
          }}
          >
        <GestureDetector gesture={pinch}>
          <Animated.View
            style={[{
              width: '100%',
              height: '100%'
            }, animatedStyles]}
          >
            
            <Image
              source={{ uri: url }}
              style={{
                height: '100%',
                width: '100%',
                resizeMode: "contain"
              }}
            />
          </Animated.View>
          </GestureDetector>
          </View>

        </TouchableWithoutFeedback>
        
        {viewOnly === false && (
          <View
            style={{
              width: screenWidth,
              alignSelf: "center",
              opacity: 1,
              backgroundColor: "black",
            }}
          >
            <ChatInput
              conversationId={conversationId || ''}
              hasEmojis={false}
              inputRef={inputRef}
              sendMessage={() => uploadImage()}
              chatUserId={chatUserId}
              recipientId={recipientId}
              // selectedMessage={activeQuote}
              value={message}
              setValue={setMessage}
              messageType="multimedia-text"
            />
          </View>
        )}
        
      </KeyboardAvoidingView>
      {uploading && (
        <View style={{ position: 'absolute', flex: 1, height: '100%', width: '100%', backgroundColor: 'rgba(0,0,0,.5)', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
      )}
    </View>
    </GestureHandlerRootView>
  );
}
