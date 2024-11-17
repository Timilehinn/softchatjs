import {
  StyleSheet,
  View,
} from "react-native";
import { BroadcastLists } from "softchatjs-react-native/src";
import { useNavigation, router } from "expo-router";
import { useClient } from "@/contexts/ClientContext";

export default function TabOneScreen() {
  const navigation = useNavigation();
  const { client } = useClient();

  return (
    <View style={styles.container}>
      <BroadcastLists
        onOpen={(item) => {
          router.navigate({
            pathname: "/(main)/three",
            params: {
              chatUser: JSON.stringify({}),
              activeConversation: JSON.stringify(item),
            },
          });
        }}
        client={client}
      />
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
