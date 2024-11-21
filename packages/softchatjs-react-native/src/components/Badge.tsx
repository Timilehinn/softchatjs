import React from "react"
import { View, Text } from "react-native";

type BadgeProps = {
  label: string | number
}

export const UnreadMessagesBadge = (props: BadgeProps) => {

  const { label } = props;

  return (
    <View style={{
      height: 25,
      width: 25,
      borderRadius: 25,
      backgroundColor: 'lightblue',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Text style={{ color: 'white', fontWeight: 'bold' }}>{label}</Text>
    </View>
  )

}