import React from "react"
import { TouchableOpacity, Text, ViewStyle } from "react-native";
import { Colors } from "../../constants/Colors";
import { getRandomColor } from "../../utils";
import { Image } from "expo-image";
import { useConfig } from "../../contexts/ChatProvider";

type MessageAvatarProps = {
  initials: string;
  size: number;
  imgUrl?: string;
  style?: ViewStyle
};

export default function MessageAvatar(props: MessageAvatarProps) {
  const { imgUrl, initials, size = 40, style } = props;
  const { fontFamily } = useConfig();

  return (
    <TouchableOpacity
      style={{
        height: size,
        width: size,
        borderRadius: size,
        backgroundColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}
    >
      {imgUrl ? (
        <Image
          source={{ uri: imgUrl }}
          cachePolicy="disk"
          style={{
            height: size,
            width: size,
            borderRadius: size,
            backgroundColor: Colors.greyLighter,
          }}
        />
      ) : (
        <Text
          style={{
            fontSize: size/2,
            textTransform: "uppercase",
            color: "white",
            fontFamily
          }}
        >
          {initials}
        </Text>
      )}
    </TouchableOpacity>
  );
}
