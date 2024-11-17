import React from "react";
import { View, Text, Dimensions, TouchableOpacity } from "react-native";
import { forwardRef, useRef, useState, useImperativeHandle } from "react";
import { generateId } from "../../../utils";
import {
  CameraIcon,
  DocumentIcon,
  ImageIcon,
  LocationIcon,
} from "../../../assets/icons";
import * as ImagePicker from "expo-image-picker";
import { Media, MediaType, Message } from "softchatjs-core";
import { useModalProvider } from "../../../contexts/ModalProvider";
import ImagePreview from "../../Modals/ImagePreview";
// import AppCamera from "../../Modals/Camera";
import { useConfig } from "../../../contexts/ChatProvider";
import VideoViewer from "../../Modals/VideoViewer";
import ActionSheet, { ActionSheetRef } from "react-native-actions-sheet";

type MediaOptionsProps = {
  recipientId: string;
  chatUserId: string;
  activeQuote: Message | null;
  clearActiveQuote: () => void;
  conversationId: string | undefined;
};

let defaultSheetHeight = "45%";

export const MediaOptions = forwardRef((props: MediaOptionsProps, ref: any) => {
  // const sheetRef = useRef<BottomSheetRef>();
  const sheetRef = useRef<ActionSheetRef>(null);
  const { theme, fontFamily } = useConfig();
  const { displayModal } = useModalProvider();
  const {
    recipientId,
    chatUserId,
    activeQuote,
    clearActiveQuote,
    conversationId,
  } = props;

  const closeSheet = () => {
    // ref.current.close();
    sheetRef.current.hide();
  };

  useImperativeHandle(ref, () => ({
    open: () => sheetRef?.current?.show(),
    close: () => closeSheet(),
    pickAttachment: () => pickImage(),
  }));

  // const openCamera = () => {
  //   sheetRef?.current?.close();
  //   displayModal({
  //     justifyContent: "flex-start",
  //     children: (
  //       <AppCamera
  //         conversationId={conversationId}
  //         chatUserId={chatUserId}
  //         recipientId={recipientId}
  //       />
  //     ),
  //   });
  // };

  const options = [
    {
      id: 0,
      label: "photos",
      icon: <ImageIcon size={20} />,
      onPress: () => pickImage(),
    },
    // {
    //   id: 1,
    //   label: "camera",
    //   icon: <CameraIcon size={20} />,
    //   onPress: () => openCamera(),
    // },
    {
      id: 2,
      label: "location",
      icon: <LocationIcon size={20} />,
    },
    // {
    //   id: 3,
    //   label: "document",
    //   icon: <DocumentIcon size={20} color="lightblue" />,
    // },
  ];

  const flatListRef = useRef(null);
  const width = Dimensions.get("window").width;
  const emojiSize = 80;
  const [image, setImage] = useState<
    (Media & { base64: string | null | undefined }) | null
  >(null);

  const pickImageWithFallback = async () => {};

  const pickImage = async () => {
    // sheetRef?.current?.hide();
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"] as any,
        aspect: [4, 3],
        quality: 0.3,
        base64: true,
      });
      if (!result.canceled) {
        var base64 = result.assets[0].base64;
        var type = result.assets[0].type;
        var height = result.assets[0].height;
        var width = result.assets[0].width;
        var fileSize = result.assets[0].fileSize;
        var fileSizeInMB = fileSize ? fileSize / (1024 * 1024) : 0; // Convert bytes to MB
        if (type === "image") {
          setTimeout(() => {
            displayModal({
              justifyContent: "flex-start",
              children: (
                <ImagePreview
                  conversationId={conversationId}
                  clearActiveQuote={clearActiveQuote}
                  activeQuote={activeQuote}
                  chatUserId={chatUserId}
                  recipientId={recipientId}
                  image={{
                    type: MediaType.IMAGE,
                    mimeType: result.assets[0].mimeType,
                    ext: ".png",
                    mediaId: generateId(),
                    base64: result.assets[0].uri as string,
                    mediaUrl: result.assets[0].uri,
                    meta: {
                      aspectRatio: width / height || 0,
                      height,
                      width,
                      size: fileSize,
                    },
                  }}
                />
              ),
            });
          },500)
          
        } else if (type === "video") {
          setTimeout(() => {
            displayModal({
              justifyContent: "flex-start",
              children: (
                <VideoViewer
                  conversationId={conversationId}
                  clearActiveQuote={clearActiveQuote}
                  activeQuote={activeQuote}
                  chatUserId={chatUserId}
                  recipientId={recipientId}
                  media={{
                    type: MediaType.VIDEO,
                    mimeType: result.assets[0].mimeType,
                    ext: ".mp4",
                    mediaId: generateId(),
                    // base64: result.assets[0].uri as string,
                    mediaUrl: result.assets[0].uri,
                    meta: {
                      aspectRatio: width / height || 0,
                      height,
                      width,
                      size: fileSize,
                    },
                  }}
                />
              ),
            });
          },500)
         
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const close = () => {
    // setHeight("45%");
    // console.log("closing");
  };

  return (
    <ActionSheet
      ref={sheetRef}
      gestureEnabled
      openAnimationConfig={{ speed: 700 }}
      containerStyle={{ 
        height: "40%", 
        padding: 20,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
      }}
    >
      <View
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: theme?.background.secondary,
          borderRadius: 20,
          padding: 10,
          marginTop: 10,
        }}
      >
        {options.map((option, i) => (
          <TouchableOpacity
            onPress={option.onPress}
            key={i}
            style={[
              {
                padding: 10,
                borderRadius: 100,
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 20,
              },
              i + 1 !== options.length && {
                borderBottomWidth: 1,
                borderBottomColor: theme?.divider,
              },
            ]}
          >
            {option.icon}
            <Text
              style={{
                marginStart: 15,
                textTransform: "capitalize",
                fontFamily,
                fontSize: 17,
                color:
                  option.label === "Delete" ? "red" : theme?.text.secondary,
              }}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ActionSheet>
  );
});

export default MediaOptions;
