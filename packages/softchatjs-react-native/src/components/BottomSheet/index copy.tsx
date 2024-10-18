import {
  View,
  Text,
  StyleSheet,
  Modal,
  Dimensions,
  ViewStyle,
  TouchableWithoutFeedback
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  withTiming,
  Extrapolation,
  withClamp,
  useDerivedValue,
  useAnimatedReaction,
  runOnJS,
  Easing,
  useAnimatedRef, 
  runOnUI,
  measure
} from "react-native-reanimated";
import {
  Directions,
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { forwardRef, useImperativeHandle, useState } from "react";

type BottomSheetprops = {
  height?: string;
  children: JSX.Element;
};

var defaultOpacity = 0.15

const BottomSheet = forwardRef(
  ({ height = "50%", children }: BottomSheetprops, ref) => {
    const animatedRef = useAnimatedRef();
    const [modal, showModal] = useState(false);
    var heightPercentageToNumber = parseInt(height.split("%")[0]);
    const screenHeight = Dimensions.get("window").height;
    const h = (screenHeight * heightPercentageToNumber) / 100;
    const releaseDistance = 100;
    const [ opacity, setOpacity ] = useState(0)
    const windowHeight = Dimensions.get('window').height;
    const dragY = useSharedValue(0);
    const touchStartY = useSharedValue(0);
    const [hasOpened, setHasOpened] = useState(false)
    const derivedValueY = useDerivedValue(() => {
      return dragY.value;
    });

    const pan = Gesture.Pan()
      .minDistance(5)
      .onTouchesDown((e) => {
        touchStartY.value = e.changedTouches[0].absoluteY;
        if(windowHeight - e.changedTouches[0].absoluteY > h){
          dragY.value = withSpring(h, {
            mass: 1,
            stiffness: 100,
            damping: 10,
          });
          runOnJS(setOpacity)(0);
          runOnJS(showModal)(false);
        }
      })
      .onUpdate((e) => {
        dragY.value = withSpring(e.translationY, {
          mass: 1,
          stiffness: 100,
          damping: 10,
        });
        runOnJS(setOpacity)(interpolate(e.translationY, [0, h], [defaultOpacity, 0], Extrapolation.CLAMP))
      })
      .onTouchesUp((e, state) => {
          if (
            e.changedTouches[0].absoluteY >
            touchStartY.value + releaseDistance
          ) {
            dragY.value = withSpring(h, {
              mass: 1,
              stiffness: 100,
              damping: 10,
            });
            runOnJS(setOpacity)(0);
            runOnJS(showModal)(false);
          } else {
            dragY.value = withSpring(0, {
              mass: 1,
              stiffness: 100,
              damping: 10,
            });
          }
      });

    const dragStyles = useAnimatedStyle(() => ({
      transform: [{ translateY: dragY.value > 0 ? dragY.value : 0 }],
    }));

    const open = () => {
      showModal(true);
      dragY.value = withTiming(0, {
        duration: 500
      })
      
    };

    const close = () => {
      showModal(false);
    };

    useImperativeHandle(ref, () => ({
      open,
      close,
    }));

    useAnimatedReaction(() => {
      return { dragY: dragY.value, touchStartY: touchStartY.value }
    }, (result, previous) => {
        runOnJS(setOpacity)(interpolate(result.dragY, [0, h], [defaultOpacity, 0], Extrapolation.CLAMP))
    });


    return (
      <Modal visible={modal} transparent animationType="slide">
        <GestureHandlerRootView style={{ flex: 1 }}>
          <GestureDetector gesture={pan}>
            <Animated.View style={[styles.main, { backgroundColor: `rgba(0,0,0,${opacity})` }]}>
                <Animated.View
                ref={animatedRef}
                  style={[
                    styles.sheet,
                    {
                      position: "absolute",
                      zIndex: 100,
                      height: height as ViewStyle["height"],
                    },
                    dragStyles,
                  ]}
                >
                  <Text>
                  {hasOpened? 'true' : 'false'}
                    </Text>
                  {children}
                </Animated.View>
            </Animated.View>
          </GestureDetector>
        </GestureHandlerRootView>
      </Modal>
    );
  }
);

export default BottomSheet;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    height: "100%",
    width: "100%",
    justifyContent: "flex-end",
  },
  sheet: {
    zIndex: 100,
    width: "100%",
    backgroundColor: "blue",
    borderRadius: 15,
  },
});
