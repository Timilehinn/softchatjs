import { View, TouchableOpacity } from 'react-native'
import React from 'react'
import { Message } from 'softchatjs-core'
import { useModalProvider } from '../../../../contexts/ModalProvider'
import ImagePreview from '../../../Modals/ImagePreview'
import { Image } from 'expo-image'

type Props = {
  message: Message
}

export default function ImageAttachment(props: Props) {

  const {
    message
  } = props;

  const {
    displayModal
  } = useModalProvider()

  return (
    <View style={{ marginBottom: 7 }}>
      {message.attachedMedia.map((media, i) => (
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
            <Image source={{ uri: media.mediaUrl }} 
              style={{ 
                height: 200, width: 250,
                borderRadius: 10, 
                marginBottom: 10,
                resizeMode: "cover"
              }} 
              cachePolicy="disk"
            />
        </TouchableOpacity>
      ))}
    </View>
  )
}