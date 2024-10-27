import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { MediaType, Message } from '../../../../types'
import { useModalProvider } from '../../../../contexts/ModalProvider'
import ImagePreview from '../../../Modals/ImagePreview'
import { AttachmentTypes } from 'softchatjs-core/src'
import AudioMessage from './VoiceMessage'
import VoiceMessage from './VoiceMessage'
import { useConfig } from 'softchatjs-react-native/src/contexts/ChatProvider'
import { Image } from 'expo-image'
import VideoPlayer from './Video'

type Props = {
  message: Message
  isPending?: boolean
}

export default function MediaMessage(props: Props) {

  const {
    message,
    isPending
  } = props;

  const { theme } = useConfig();

  const {
    displayModal
  } = useModalProvider()

  return (
    <View style={{ marginBottom: message?.message? 7 : 0 }}>
      {message.attachedMedia.map((media, i) => {
        if(media.type === MediaType.IMAGE){
          return (
              <TouchableOpacity
                onPress={() => 
                  displayModal({
                    justifyContent: 'flex-start',
                    children: <ImagePreview viewOnly clearActiveQuote={() => {}} activeQuote={null} chatUserId={''} recipientId={''} image={
                      media
                    } />
                  })
                }
                key={i} activeOpacity={.7}>
                  <Image source={{ uri: isPending? media.mediaUrl : media.mediaUrl }} 
                    style={{ 
                      height: 200, width: 250,
                      borderRadius: 10, 
                      marginBottom: 10,
                      resizeMode: "cover"
                    }} 
                    cachePolicy="disk"
                  />
              </TouchableOpacity>
          )
        }else if(media.type === MediaType.AUDIO){
          return (
            <View key={i} style={{ marginBottom: 5 }}>
              <VoiceMessage media={media} textColor={theme?.text.secondary} />
            </View>
          )
        }else if(media.type === MediaType.VIDEO) {
          return (
            <VideoPlayer key={i} media={media} />
          )
        }
      })}
    </View>
  )
}