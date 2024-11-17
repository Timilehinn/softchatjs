import React, { useRef, useState } from 'react'
import { View, Text, StyleSheet, Button, TouchableOpacity } from 'react-native'
import { Video, ResizeMode } from 'expo-av';
import { Media, Message } from 'softchatjs-core';
import { useModalProvider } from '../../../../contexts/ModalProvider';
import VideoViewer from '../../../Modals/VideoViewer';
import { PlayIcon } from '../../../../assets/icons';
import { useConfig } from '../../../../contexts/ChatProvider';
import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";


export default function VideoPlayer(props: { media: Media, message: Message, recipientId: string, position: "left" | "right" }) {

  const { client, theme } = useConfig()
  const video = useRef(null);
  const [status, setStatus] = useState({});
  const { displayModal } = useModalProvider();

  const player = useVideoPlayer(props.media.mediaUrl, (player) => {
    // player.loop = true;
    // player.play();
  });

  const deleteMessage = () => {
    if (client) {
      client
        .messageClient(props.message.conversationId)
        .deleteMessage(
          props.message.messageId,
          props.recipientId,
          props.message.conversationId
        );
    }
  };

  return (
    <TouchableOpacity onPress={() =>
      displayModal({
        justifyContent: 'flex-start',
        children: <VideoViewer onDelete={deleteMessage} conversationId={''} clearActiveQuote={() => {}} view activeQuote={null} chatUserId={''} recipientId={''} media={
          props.media
        } />
      })
    } style={{ ...styles.container, borderRadius: 16.5, padding: 2, backgroundColor: props.position === "right"? theme.chatBubble.right.bgColor : theme.chatBubble.left.bgColor }}>
      <VideoView
        style={styles.video}
        player={player}
        contentFit="cover"
      />
      <View style={{ flex: 1, position: "absolute", borderRadius: 15, height: '100%', width: '100%', backgroundColor: "rgba(0,0,0,.6)", alignItems: 'center', justifyContent: 'center' }}>
        <PlayIcon color='white' size={30} />
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 200, 
    minWidth: 250,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttons: {

  },
  video: {
    flex: 1,
    borderRadius: 15
  }
})