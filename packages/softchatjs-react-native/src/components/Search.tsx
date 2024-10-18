import { View, Text, TextInput, ViewStyle } from "react-native";
import React from "react";
import { SetState } from "../types";
import { Colors } from "../constants/Colors";
import { useConfig } from "../contexts/ChatProvider";

type Search = {
  value: string;
  setValue: SetState<string>;
  placeholder: string;
  containerStyle?: ViewStyle;
};

export default function Search(props: Search) {
  const { theme } = useConfig();
  const { value, setValue, placeholder, containerStyle } = props;
  return (
    <View
      style={{
        paddingHorizontal: 10,
        marginVertical: 10,
        width: "100%",
        ...containerStyle,
      }}
    >
      <TextInput
        style={{
          height: 45,
          width: "100%",
          borderWidth: 1,
          borderColor: theme?.divider,
          borderRadius: 10,
          paddingStart: 10,
          color: theme?.text.secondary
        }}
        placeholder={placeholder}
        placeholderTextColor="grey"
        value={value}
        onChangeText={(val) => setValue(val)}
      />
    </View>
  );
}
