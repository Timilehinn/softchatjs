import React, { createContext, useContext, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
  Text,
} from "react-native";
import { Children } from "../types";
import { stopPropagation } from "../utils";

type ModalProps = {
  dismissable?: boolean;
  justifyContent?: ViewStyle["justifyContent"];
  children: Children | null;
  animation?: "none" | "fade" | "slide" | undefined;
  containerWidth?: ViewStyle["width"];
};

type ModalProvider = {
  displayModal: (child: ModalProps) => void;
  resetModal: (cb?: Function) => void;
};

const initial: ModalProvider & { modalProps: ModalProps | null } = {
  displayModal: () => {},
  resetModal: () => {},
  modalProps: {
    dismissable: true,
    justifyContent: "center",
    children: null,
    animation: "slide",
    containerWidth: "100%",
  },
};

const ModalProviderContext = createContext<ModalProvider>(initial);

export const useModalProvider = () => useContext(ModalProviderContext);

export default function ModalProvider(props: { children: Children }) {
  const { children } = props;

  const [modal, showModal] = useState(false);
  const [modalProps, setModalProps] = useState(initial.modalProps);

  const displayModal = (props: ModalProps) => {
    showModal(true);
    setModalProps({ ...initial.modalProps, ...props });
  };

  const dismiss = () => {
    if (modalProps?.dismissable) {
      showModal(false);
    }
  };

  const resetModal = (cb?: Function) => {
    showModal(false);
    cb?.();
  };

  return (
    <ModalProviderContext.Provider
      value={{
        displayModal,
        resetModal,
      }}
    >
      {children}
      <Modal
        animationType={modalProps?.animation}
        style={{ height: "100%", width: "100%" }}
        visible={modal}
        transparent
      >
        <View
          style={{
            flex: 1,
            height: "100%",
            width: "100%",
            alignItems: "center",
            justifyContent: modalProps?.justifyContent,
            backgroundColor: "rgba(0,0,0,.3)",
          }}
        >
          <View style={{ flex: 1, width: "100%", height: "100%" }}>
            {modalProps?.children}
          </View>
        </View>
      </Modal>
    </ModalProviderContext.Provider>
  );
}
