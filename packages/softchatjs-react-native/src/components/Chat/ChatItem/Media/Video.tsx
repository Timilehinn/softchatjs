import React, { useRef, useState } from 'react'
import { View, Text, StyleSheet, Button, TouchableOpacity } from 'react-native'
import { Video, ResizeMode } from 'expo-av';
import { Media, Message } from 'softchatjs-core';
import { useModalProvider } from '../../../../contexts/ModalProvider';
import VideoViewer from '../../../Modals/VideoViewer';
import { MediaType } from '../../../../types';
import { PlayIcon } from '../../../../assets/icons';
import { useConfig } from '../../../../contexts/ChatProvider';

export default function VideoPlayer(props: { media: Media, message: Message, recipientId: string }) {

  const { client } = useConfig()
  const video = useRef(null);
  const [status, setStatus] = useState({});
  const { displayModal } = useModalProvider();

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
    } style={styles.container}>
      <Video
        ref={video}
        style={styles.video}
        source={{
          uri: props.media.mediaUrl,
        }}
        // useNativeControls
        resizeMode={ResizeMode.COVER}
        isLooping
        onPlaybackStatusUpdate={status => setStatus(() => status)}
      />
      <View style={{ flex: 1, position: "absolute", borderRadius: 5, height: '100%', width: '100%', backgroundColor: "rgba(0,0,0,.6)", alignItems: 'center', justifyContent: 'center' }}>
        <PlayIcon color='white' size={30} />
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 200, minWidth: 250,
  },
  buttons: {

  },
  video: {
    flex: 1,
    borderRadius: 5
  }
})