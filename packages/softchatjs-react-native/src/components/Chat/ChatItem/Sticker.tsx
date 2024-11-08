import { Message } from "softchatjs-core";
import React, { useCallback } from "react";
import { Image } from "expo-image";

type SickerProps = {
  message: Message;
};

export default function Sticker(props: SickerProps) {
  
  const { message } = props;

  const renderSicker = useCallback(() => {
    return (
      <Image
      source={{ uri: message.attachedMedia[0].mediaUrl }}
      cachePolicy="disk"
      style={{ height: 70, width: 70 }}
    />
    )
  },[])

  return (
    <>{renderSicker()}</>
  );
}
