import {
  StyleSheet,
  Platform,
  TouchableOpacity,
  Text,
  View,
} from "react-native";
import { BroadcastLists } from "softchatjs-react-native/src";
import { useNavigation, router } from "expo-router";
import { useRef } from "react";
import { ConversationsRefs } from "softchatjs-react-native/src/components/Conversations";
import { useClient } from "@/contexts/ClientContext";

export default function TabOneScreen() {
  const navigation = useNavigation();
  const { client } = useClient();

  return (
    <View style={styles.container}>
      <BroadcastLists client={client} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  title: {
    fontSize: 20,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
