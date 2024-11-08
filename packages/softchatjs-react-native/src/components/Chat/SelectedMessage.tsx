import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  FlatList,
} from "react-native";
import { AttachmentTypes, Message } from "softchatjs-core";
import { CloseIcon } from "../../assets/icons";
import { Colors } from "../../constants/Colors";
import { truncate } from "../../utils";
import { useConfig } from "../../contexts/ChatProvider";
import { FlashList } from "@shopify/flash-list";

type SelectedMessageProps = {
  message: Message | null;
  messageRef: React.MutableRefObject<View | undefined> | null;
  scrollRef: React.MutableRefObject<FlashList<string | Message> | null>;
  onClear: () => void;
  itemIndex: number;
};

export default function SelectedMessage(props: SelectedMessageProps) {
  const { message, onClear, messageRef, scrollRef, itemIndex } = props;
  const { theme, fontFamily } = useConfig();
  
  const highLightChat = () => {
    try {
      if (messageRef?.current) {
        messageRef.current.setNativeProps({
          style: { backgroundColor: theme?.background.secondary },
        });
        setTimeout(() => {
          if (messageRef.current) {
            messageRef.current.setNativeProps({
              style: { backgroundColor: "transparent" },
            });
          }
        }, 1000);
        if (scrollRef?.current) {
          scrollRef.current.scrollToIndex({ animated: true, index: itemIndex });
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        console.warn(error?.message);
      }
    }
  };

  return (
    <View style={{ 
      ...styles.main,
      borderTopColor: theme?.divider,
      }}>
      {message && (
        <TouchableOpacity style={{ flex: 1 }} onPress={() => highLightChat()}>
          <Text style={{
            ...styles.message,
            color: theme?.text.secondary,
            fontFamily
          }}>{message.attachmentType === AttachmentTypes.NONE? truncate(message.message, 55) : message.attachedMedia?.[0]?.type || '...'}</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity activeOpacity={0.7} onPress={onClear}>
        <CloseIcon bgColor={Colors.greyLighter} size={20} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    height: 40,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderTopWidth: 0.5,
  },
  message: {
    marginStart: 8,
  },
});
