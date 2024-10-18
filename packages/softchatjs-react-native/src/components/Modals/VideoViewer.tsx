// import { View, Text, StyleSheet, Button } from 'react-native'
// import React, { useEffect, useRef, useState } from 'react'
// import { Media } from '../../types';
// import { useVideoPlayer, VideoView } from 'expo-video';
// import Video, {VideoRef} from 'react-native-video';
// type VideoViewerProps = {
//   image: (Media & { base64?: string | undefined }) | null;
//   chatUserId: string;
//   recipientId: string;
//   activeQuote: Media | null;
//   clearActiveQuote: () => void;
//   viewOnly?: boolean,
//   conversationId?: string | undefined
// };

// const videoSource =
//   'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

// export default function VideoViewer(props: VideoViewerProps) {

//   const { image, chatUserId, recipientId, activeQuote, clearActiveQuote, viewOnly = false, conversationId } = props;

//   const ref = useRef(null);
//   const [isPlaying, setIsPlaying] = useState(true);
//   const player = useVideoPlayer(image?.base64, player => {
//     player.loop = true;
//     player.play();
//   });

//   useEffect(() => {
//     const subscription = player.addListener('playingChange', isPlaying => {
//       setIsPlaying(isPlaying);
//     });

//     return () => {
//       subscription.remove();
//     };
//   }, [player]);

//   return (
//     <View style={styles.container}>
//       <VideoView
//         ref={ref}
//         style={styles.video}
//         player={player}
//         allowsFullscreen
//         allowsPictureInPicture
//       />
//       <View style={styles.controlsContainer}>
//         <Button
//           title={isPlaying ? 'Pause' : 'Play'}
//           onPress={() => {
//             if (isPlaying) {
//               player.pause();
//             } else {
//               player.play();
//             }
//             setIsPlaying(!isPlaying);
//           }}
//         />
//       </View>
//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1, 
//     height: '100%',
//     width: "100%",
//     backgroundColor: "black",
//     alignItems: 'center',
//     justifyContent: 'center'
//   },
//   video: {
//     width: 350,
//     height: 275,
//   },
//   controlsContainer: {
//     padding: 10,
//   },
// })

import { View, Text } from 'react-native'
import React from 'react'

export default function VideoViewer() {
  return (
    <View>
      <Text>VideoViewer</Text>
    </View>
  )
}