import { TouchableOpacity, Text, ViewStyle } from "react-native";
import { Colors } from "../../constants/Colors";
import { getRandomColor } from "../../utils";
import { Image } from "expo-image";

type MessageAvatarProps = {
  initials: string;
  size: number;
  imgUrl?: string;
  style?: ViewStyle
};

export default function MessageAvatar(props: MessageAvatarProps) {
  const { imgUrl, initials, size = 40, style } = props;

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
            fontWeight: "800",
            fontSize: size/2,
            textTransform: "uppercase",
            color: "white",
          }}
        >
          {initials}
        </Text>
      )}
    </TouchableOpacity>
  );
}
