import { View, Text } from "react-native";
import React from "react";
import { LinkPreview } from "@flyerhq/react-native-link-preview";
import { useConfig } from "../../../contexts/ChatProvider";
import { truncate } from "../../../utils";
import { LinkIcon } from "../../../assets/icons";
import { Image } from "expo-image";

export default function Preview({
  message,
  color,
}: {
  message: string;
  color: string;
}) {
  const { theme, fontFamily } = useConfig();

  const urlRegex = /(https?:\/\/[^\s]+)/gi;

  if (!urlRegex.test(message)) {
    return null;
  }

  return (
    <LinkPreview
      text={message}
      renderLinkPreview={(data) => (
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            width: '100%',
            minWidth: 220,
            marginBottom: 5,
            // borderWidth: 1,
            // borderColor: theme?.icon,
            padding: 8,
            borderRadius: 10
          }}
        >
          {data.previewData?.image?.url? (
            <View style={{ height: 80, width: 80, borderRadius: 10, backgroundColor: "lightgrey", alignItems: 'center', justifyContent: "center" }}>
              <LinkIcon color="black" />
            </View>
          ):(
            <Image
              source={{ uri: data.previewData?.image?.url }}
              cachePolicy="disk"
              style={{ backgroundColor: "lightgrey", borderRadius: 10, height: 80, width: 80 }}
            />
          )}
          
          <View style={{ flex: 1, width: '100%' }}>
            <Text
              style={{
                display: data.previewData?.title? "flex" : "none",
                flex: 1,
                color: color,
                marginStart: 8,
                textDecorationLine: "underline",
                fontFamily
              }}
            >
              {data.previewData?.title}
            </Text>
            <Text
              style={{
                display: data.previewData?.description? "flex" : "none",
                flex: 1,
                color: color,
                fontSize: 12,
                marginStart: 8,
                textDecorationLine: "underline",
                fontFamily
              }}
            >
              {truncate(data.previewData?.description || "", 100)}
            </Text>
          </View>
        </View>
      )}
    />
  );
}
