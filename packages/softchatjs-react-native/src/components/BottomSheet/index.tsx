import React from 'react';
import { Dimensions } from "react-native";
import { useSharedValue, withTiming } from "react-native-reanimated";
import SheetBackDrop from "./BackDrop";
import { forwardRef, useImperativeHandle, useState } from "react";
import Manager from "./Manager";

type BottomSheetprops = {
  height?: string;
  children: JSX.Element;
  onClose?: () => void;
};

export type BottomSheetRef = {
  open: () => void,
  close: () => void,
}

const BottomSheet = forwardRef(
  ({ height = "50%", onClose, children }: BottomSheetprops, ref: any) => {
    const [modal, showModal] = useState(false);
    var heightPercentageToNumber = parseInt(height.split("%")[0]);
    const screenHeight = Dimensions.get("window").height;
    const h = (screenHeight * heightPercentageToNumber) / 100;
    const releaseDistance = 100;
    const windowHeight = Dimensions.get("window").height;
    const dragY = useSharedValue(h);
    const touchStartY = useSharedValue(0);

    const open = () => {
      dragY.value = withTiming(0, {
        duration: 300,
      });
      showModal(true);
    };

    const close = () => {
      dragY.value = withTiming(h, {
        duration: 300,
      });
      showModal(false);
    };

    useImperativeHandle(ref, () => ({
      open,
      close,
    }));

    return (
      <>
        <Manager
          dragY={dragY}
          touchStartY={touchStartY}
          modal={modal}
          windowHeight={windowHeight}
          h={h}
          releaseDistance={releaseDistance}
          height={height}
          children={children}
          showModal={showModal}
          onClose={() => onClose?.()}
        />
        {modal && (
          <SheetBackDrop
            showModal={showModal}
            windowHeight={windowHeight}
            dragY={dragY}
          />
        )}
      </>
    );
  }
);

export default BottomSheet;
