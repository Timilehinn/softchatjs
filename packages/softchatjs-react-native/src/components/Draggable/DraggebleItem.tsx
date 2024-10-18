import React from 'react'
import Animated from 'react-native-reanimated'
import { Children } from '../../types'
import { ViewStyle } from 'react-native';

type DraggebleItemProps = {
  children: Children;
  animatedStyles: ViewStyle
}

export default function DraggebleItem(props: DraggebleItemProps) {

  const {
    children,
    animatedStyles
  } = props;

  return (
    <Animated.View
      style={[
        animatedStyles,
        {
          flex: 1,
          borderBottomWidth: 0,
          // borderColor: theme?.divider,
          // backgroundColor: theme?.background.primary
        },
      ]}
    >
      {children}
    </Animated.View>
  )
}
