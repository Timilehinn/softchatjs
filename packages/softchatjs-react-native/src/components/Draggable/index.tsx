import React from 'react'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolation,
  useAnimatedReaction,
  runOnJS,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Dimensions, Platform, TouchableWithoutFeedback, View } from 'react-native';
import { Children } from '../../types';
import DraggebleItem from './DraggebleItem';

type DraggebleProps = {
  disable?: boolean;
  onLongPress?: () => void;
  children: Children,
  actionContainer?: Children
}

export default function Draggeble(props: DraggebleProps) {

  const {
    disable,
    onLongPress,
    children,
    actionContainer
  } = props;

  const pressed = useSharedValue(false);
  const offset = useSharedValue(0);
  const [finished, setFinished] = React.useState(false);
  const [threshHoldReached, setThreshHoldReached] = React.useState(false);

  const touchStart = useSharedValue({ x: 0, y: 0, time: 0 });
  const touchStartX = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const maxThreshHold = -90;
  const TOUCH_SLOP = Platform.OS === "android" ? 40 : 10;
  const DISTANCE_TO_ACTIVATE_PAN = 70;
  const deviceWidth = Dimensions.get("window").width;

  const pan = Gesture.Pan()
    .minDistance(DISTANCE_TO_ACTIVATE_PAN)
    .onTouchesDown((e, state) => {
      touchStart.value = {
        x: e.changedTouches[0].x,
        y: e.changedTouches[0].y,
        time: Date.now(),
      };
    })
    .onTouchesMove((e, state) => {
      if (disable) {
        return;
      }
      touchStartX.value = e.changedTouches[0].x;
      if (e.changedTouches[0].x + TOUCH_SLOP < touchStart.value.x) {
        state.activate();
      }
    })
    .onTouchesUp((e, state) => {
      // touchStartX.value = 0;
      state.fail();
    })
    .onUpdate((e) => {
      if (Math.abs(e.translationX) < deviceWidth * (30 / 100)) {
         offset.value = e.translationX
        //  offset.value = withTiming(e.translationX);
      }
    })
    .onFinalize(() => {
      isDragging.value = false;
      // offset.value = withSpring(0, {
      //   damping: 100,
      // });
      pressed.value = false;
    });

  const animatedStyles = useAnimatedStyle(() => ({
    zIndex: 100,
    backgroundColor: 'red',
    transform: [{ translateX: offset.value < -1 ? offset.value : 0 }],
  }));

  const shareStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      offset.value,
      [-30, -100],
      [0, 1],
      Extrapolation.CLAMP
    ),
    transform: [
      {
        translateX: interpolate(
          offset.value,
          [-20, -100],
          [-1, -50],
          Extrapolation.CLAMP
        ),
      },
      // {
      //   scale: interpolate(
      //     offset.value,
      //     [-30, -50],
      //     [0, 1],
      //     Extrapolation.CLAMP
      //   ),
      // },
    ],
  }));

  useAnimatedReaction(
    () => {
      return {
        offsetValue: offset.value,
        pressedValue: pressed.value,
        touchValue: touchStart.value,
      };
    },
    (result, previous) => {
      var value = Math.ceil(result.offsetValue);
      var value2 = result.pressedValue;
      if (value < maxThreshHold + 10) {
        runOnJS(setThreshHoldReached)(true);
        runOnJS(setFinished)(!value2);
      } else {
        runOnJS(setFinished)(false);
        runOnJS(setThreshHoldReached)(false);
      }
    }
  );

  return (
    <GestureDetector gesture={pan}>
        <TouchableWithoutFeedback
          onLongPress={() => onLongPress?.()}
        >
          <View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'green' }}>
          <DraggebleItem animatedStyles={animatedStyles}>
            {children}
          </DraggebleItem>
          <View style={{ position: 'absolute', left: 0, top: 0, backgroundColor: 'yellow', flex: 1, height: '100%', width: "100%", }}></View>
          {/* <Animated.View
              style={[
                // styles.reply,
                { 
                  minWidth: 100,
                  right: -100, 
                  position: "absolute", 
                  height: '100%' },
                shareStyle,
              ]}
            >
              {actionContainer}
            </Animated.View> */}
          </View>
        </TouchableWithoutFeedback>
      </GestureDetector>
  )
}
