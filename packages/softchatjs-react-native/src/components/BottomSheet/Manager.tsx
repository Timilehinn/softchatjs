import React from 'react';
import { StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useAnimatedReaction,
  runOnJS,
  SharedValue,
  withTiming,
  useSharedValue,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { SetState } from "../../types";
import { useEffect } from "react";
import { Colors } from "../../constants/Colors";
import { useConfig } from "../../contexts/ChatProvider";

type Manager = {
  dragY: SharedValue<number>;
  touchStartY: SharedValue<number>;
  modal: boolean;
  windowHeight: number;
  h: number;
  releaseDistance: number;
  height: string;
  children: JSX.Element;
  showModal: SetState<boolean>;
  scrollRef?: any;
  onClose: () => void;
  hasNotch?: boolean
};

const Manager = (props: Manager) => {
  const {
    dragY,
    touchStartY,
    modal,
    windowHeight,
    h,
    releaseDistance,
    height,
    children,
    showModal,
    scrollRef,
    onClose,
    hasNotch = true
  } = props;

  const dragHeight = useSharedValue(h);

  const { theme } = useConfig();

  const pan = Gesture.Pan()
    .onTouchesDown((e) => {
      touchStartY.value = e.changedTouches[0].absoluteY;
      if (windowHeight - e.changedTouches[0].absoluteY > h) {
        dragY.value = withSpring(h, {
          mass: 1,
          stiffness: 100,
          damping: 10,
        });
        runOnJS(showModal)(false);
      }
    })
    .onUpdate((e) => {
      dragY.value = withSpring(e.translationY, {
        mass: 1,
        stiffness: 1000,
        damping: 30,
      });
    })
    .onTouchesUp((e, state) => {
      if (e.changedTouches[0].absoluteY > touchStartY.value + releaseDistance) {
        dragY.value = withTiming(h, {});
        runOnJS(showModal)(false);
      } else {
        dragY.value = withTiming(0, {});
      }
    });

  useAnimatedReaction(
    () => {
      return { dragY: dragY.value, touchStartY: touchStartY.value };
    },
    (result, previous) => {}
  );

  const dragStyles = useAnimatedStyle(() => ({
    transform: [
      { translateY: dragY.value > 0 ? dragY.value : 0 },
    ],
  }));

  useEffect(() => {
    if (!modal) {
      if (onClose) {
        onClose();
      }
    }
  }, [modal]);

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          styles.sheet,
          {
            position: "absolute",
            bottom: 0,
            height: height as ViewStyle["height"],
            backgroundColor: theme?.background.primary,
          },
          dragStyles,
        ]}
      >
        {hasNotch && (
          <View style={{ marginVertical: 10, width: '100%', alignItems: 'center' }}>
            <View style={{ height: 6, width: 60, borderRadius: 5, backgroundColor: Colors.greyLighter }} />
          </View>
        )}
        {children}
      </Animated.View>
    </GestureDetector>
  );
};

export default Manager;

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
    bottom: 0,
    flex: 1,
    backgroundColor: "black",
  },
  sheet: {
    zIndex: 100,
    width: "100%",
    borderRadius: 15,
  },
});
