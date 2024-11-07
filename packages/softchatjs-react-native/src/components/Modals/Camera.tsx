// import React from 'react';
// import { CameraView, useCameraPermissions } from 'expo-camera';
// import { useRef, useState } from 'react';
// import { Button, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import { CameraFlipIcon, XIcon } from '../../assets/icons';
// import { useModalProvider } from '../../contexts/ModalProvider';
// import ImagePreview from './ImagePreview';
// import { MediaType } from '../../types';
// import { generateId } from '../../utils';
// import { useConfig } from '../../contexts/ChatProvider';

// const width = Dimensions.get("window").width

// type Props = {
//   chatUserId: string;
//   recipientId: string;
//   conversationId: string | undefined
// }

// export default function AppCamera(props: Props) {

//   const {
//     chatUserId,
//     recipientId,
//     conversationId
//   } = props;
//   const { theme } = useConfig();

//   const camRef = useRef<CameraView | undefined>()
//   const { displayModal, resetModal } = useModalProvider()
//   const [facing, setFacing] = useState<"back" | "front">('back');
//   const [permission, requestPermission] = useCameraPermissions();

//   if (!permission) {
//     // Camera permissions are still loading.
//     return <View />;
//   }

//   if (!permission.granted) {
//     // Camera permissions are not granted yet.
//     return (
//       <View style={{ width: "100%", alignItems: "center", justifyContent: 'center', backgroundColor: theme?.background.primary, height: '100%' }}>
//       <View
//         style={{
//           height: 250,
//           width: 250,
//           borderWidth: 0.5,
//           borderColor: "lightgrey",
//           marginTop: 5,
//           borderRadius: 30,
//           alignItems: 'center',
//           justifyContent: 'center'
//         }}
//       >
//         <View
//           style={{
//             height: "60%",
//             width: "60%",
//             borderWidth: 0.5,
//             borderColor: "lightgrey",
//             borderRadius: 200,
//           }}
//         />
//       </View>
//       <Text
//         style={{
//           fontSize: 25,
//           marginTop: 10,
//           textAlign: "center",
//           color: theme?.text.secondary,
//           marginBottom: 25
//         }}
//       >
//         We need permission to{"\n"} access Camera.
//       </Text>
//       <Button onPress={requestPermission} title='Gran permission' />
//     </View>
//     );
//   }

//   function toggleCameraFacing() {
//     setFacing(current => (current === 'back' ? 'front' : 'back'));
//   }

//   const takePicture = async () => {
//     try {
//       if(camRef?.current){
//         const captured = await camRef.current.takePictureAsync({
//           quality: .3,
//           base64: true,
//           scale: 10,
//           isImageMirror: true
//         });
//         if(captured?.uri){
//           displayModal({
//             justifyContent: 'flex-start',
//             children: <ImagePreview clearActiveQuote={() => {}} conversationId={conversationId} activeQuote={null} chatUserId={chatUserId} recipientId={recipientId} image={
//               {
//                 type: MediaType.IMAGE,
//                 ext: '.png',
//                 mediaId: generateId(),
//                 base64: captured?.uri,
//                 mediaUrl: captured.uri,
//                 mimeType: 'image/png',
//                 meta: {
//                   aspectRatio: captured.width / captured.height || 0,
//                   height: captured.height,
//                   width: captured.width,
//                   size: 0
//                 }
//               }
//             }/>
//           })
//         }else{
//           console.error('Unable to convert to base64')
//         }
//       }else{
//         console.error('Not not available')
//       }
//     } catch (error) {
//       if(error instanceof Error){
//         console.log(error.message)
//       }
//     }
//   }

//   return (
//     <View style={styles.container}>
//       <CameraView ref={camRef as any} style={styles.camera} facing={facing}>
//       {/* <CameraView ref={camRef} style={styles.camera} facing={facing}> */}
//         <View style={styles.buttonContainer}>
//           <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
//             <CameraFlipIcon size={40} />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.button} onPress={takePicture}>
//             <View style={{ borderWidth: 3, borderColor: 'black', borderRadius: 100, padding: 30, backgroundColor: 'white' }} />
//           </TouchableOpacity>
//           <TouchableOpacity  style={styles.button} onPress={() => resetModal()}>
//             <XIcon color='black' size={40} />
//           </TouchableOpacity>
//         </View>
//       </CameraView>

    
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     backgroundColor: 'white'
//   },
//   camera: {
//     flex: 1,
//   },
//   buttonContainer: {
//     left: 0,
//     paddingHorizontal: 25,
//     bottom: 30,
//     position: "absolute",
//     width: '100%',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     backgroundColor: 'transparent',
//     alignItems: 'center',
//   },
//   button: {
//     alignItems: 'center',
//     padding: 10, 
//     borderRadius: 100,
//     backgroundColor: 'white'
//   },
//   text: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: 'white',
//   },
// });