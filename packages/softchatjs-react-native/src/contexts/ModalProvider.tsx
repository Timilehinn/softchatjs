import React, { createContext, useContext, useState } from "react"
import { KeyboardAvoidingView, Modal, ScrollView, StyleSheet, TouchableWithoutFeedback, View, ViewStyle, Text } from "react-native"
import Animated, { SharedValue, interpolate, useAnimatedStyle, useSharedValue, withDecay, withTiming } from "react-native-reanimated"
import { Children } from "../types"
import { stopPropagation } from "../utils"

type ModalProps = {
  dismissable?: boolean,
  justifyContent?: ViewStyle["justifyContent"],
  children: Children | null,
  animation?: "none" | "fade" | "slide" | undefined,
  containerWidth?: ViewStyle["width"]
}

type ModalProvider = {
  displayModal: (child: ModalProps) => void;
  resetModal: (cb?: Function) => void;
  displayInAppNotification: () => void;
}

const initial: ModalProvider & { modalProps: ModalProps | null } = {
  displayModal: () => {},
  resetModal: () => {},
  modalProps: {
    dismissable: true,
    justifyContent: 'center',
    children: null,
    animation: "slide",
    containerWidth: "100%" 
  },
  displayInAppNotification: () => {}
}

const ModalProviderContext = createContext<ModalProvider>(
  initial
);

const ToastContainer = (props: { slideAnimation: ViewStyle }) => {
  return (
    <Animated.View
    style={[
      {
        position: "absolute",
        top: -110,
        height: 100,
        width: "80%",
        borderRadius: 10,
        backgroundColor: "red",
        zIndex: 99,
        alignSelf: "center",
      },
      props.slideAnimation,
    ]}
  >
    <Text>Hey there</Text>
  </Animated.View>
  )
}

export const useModalProvider = () => useContext(ModalProviderContext);

export default function ModalProvider(props: { children: Children }) {

  const {
    children,
  } = props;

  const slideY = useSharedValue(0);

  const [ modal, showModal ] = useState(false);
  const [ modalProps, setModalProps ] = useState(initial.modalProps)

  const displayModal = (props: ModalProps) => {
    showModal(true);
    setModalProps({ ...initial.modalProps, ...props })
  }

  const dismiss = () => {
    if(modalProps?.dismissable) {
      showModal(false);
    }
  }

  const resetModal = (cb?: Function) => {
    showModal(false);
    cb?.();
  }

  const displayInAppNotification = () => {
    slideY.value = withTiming(150);
    setTimeout(() => {
      slideY.value = withTiming(0);
    }, 2000);
  };

  const slideAnimation = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: slideY.value }],
      opacity: interpolate(slideY.value, [ 0, 150 ], [ 0, 1 ]),
    };
  });

  return (
    <ModalProviderContext.Provider
    value={{
      displayModal,
      resetModal,
      displayInAppNotification
    }}
    >
    {children}
     <Modal animationType={modalProps?.animation} visible={modal} transparent>
      <TouchableWithoutFeedback onPress={dismiss}>
          <View style={{ flex: 1, height: '100%', width: "100%", alignItems: 'center', justifyContent: modalProps?.justifyContent, backgroundColor: "rgba(0,0,0,.3)" }}>
          <ToastContainer slideAnimation={slideAnimation}/>
          <TouchableWithoutFeedback onPress={(e) => stopPropagation(e)}>
            <View  style={{ flex: 1, width: '100%', height: '100%' }}>
              {modalProps?.children}
            </View>
          </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
     </Modal>
    <ToastContainer slideAnimation={slideAnimation}/>
    </ModalProviderContext.Provider>
  )
}