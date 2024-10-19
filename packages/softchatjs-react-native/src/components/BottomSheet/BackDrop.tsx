import React from 'react';
import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
  runOnJS,
  SharedValue,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { SetState } from "../../types";

type SheetBackDrop = {
  dragY: SharedValue<number>;
  showModal: SetState<boolean>;
  windowHeight: number;
};

const SheetBackDrop = ({ dragY, showModal, windowHeight }: SheetBackDrop) => {
  const tap = Gesture.Tap()
    .onBegin(() => {
      dragY.value = withSpring(windowHeight, {
        mass: 1,
        stiffness: 100,
        damping: 10,
      });
    })
    .onFinalize(() => {
      runOnJS(showModal)(false);
    });

  const backdropStyles = useAnimatedStyle(() => ({
    opacity: interpolate(
      dragY.value,
      [0, windowHeight/2],
      [0.7, 0],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <GestureDetector gesture={tap}>
      <Animated.View
        style={[
          styles.backdrop,
          {
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: "100%",
            left: 0,
          },
          backdropStyles,
        ]}
      ></Animated.View>
    </GestureDetector>
  );
};

export default SheetBackDrop;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    height: "100%",
    width: "100%",
    justifyContent: "flex-end",
    backgroundColor: "green",
    position: "absolute",
    bottom: 0,
    left: 0,
  },
  backdrop: {
    zIndex: 50,
    flex: 1,
    backgroundColor: "black",
  },
  sheet: {
    zIndex: 100,
    width: "100%",
    backgroundColor: "red",
    borderRadius: 15,
  },
});
