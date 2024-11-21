import {
  StyleSheet,
  Platform,
  TouchableOpacity,
  Text,
  View,
} from "react-native";
import { Conversations } from "softchatjs-react-native/src";
import { useNavigation, router } from "expo-router";
import { useEffect, useRef } from "react";
import { ConversationsRefs } from "softchatjs-react-native/src/components/Conversations";
import { useClient } from "@/contexts/ClientContext";
import SlateRenderer from "@/components/SlateRenderer";
import { store } from "@/constants/Store";

const users = [
  {
    username: "skyline_ace",
    uid: "a1b2c3d4e5",
    firstname: "Alex",
    lastname: "Smith",
    profileUrl: "https://avatar.iran.liara.run/public",
    custom: { bio: "Lover of heights", hobby: "Climbing" },
    color: "#3498db",
  },
  {
    username: "tech_guru",
    uid: "f6g7h8i9j0",
    firstname: "Priya",
    profileUrl: "https://avatar.iran.liara.run/public",
    custom: { bio: "Coding expert", location: "San Francisco" },
    color: "#e74c3c",
  },
  {
    username: "wanderlust_joe",
    uid: "k1l2m3n4o5",
    firstname: "Joe",
    lastname: "Wander",
    custom: { favCity: "Tokyo", travelCount: "23" },
    color: "#2ecc71",
  },
  {
    username: "green_thumb",
    uid: "p6q7r8s9t0",
    firstname: "Lily",
    lastname: "Green",
    profileUrl: "https://avatar.iran.liara.run/public",
    custom: { plantCount: "67", hobby: "Gardening" },
    color: "#27ae60",
  },
  {
    username: "chefmax",
    uid: "u1v2w3x4y5",
    lastname: "Mendez",
    profileUrl: "https://avatar.iran.liara.run/public",
    custom: { specialty: "Italian Cuisine" },
    color: "#f39c12",
  },
  {
    username: "code_maverick",
    uid: "z6a7b8c9d0",
    firstname: "Sara",
    profileUrl: "https://avatar.iran.liara.run/public",
    custom: { bio: "Full-Stack Developer", favoriteLang: "JavaScript" },
    color: "#9b59b6",
  },
  {
    username: "blue_sky_98",
    uid: "e1f2g3h4i5",
    firstname: "Mark",
    lastname: "Sky",
    color: "#2980b9",
  },
  {
    username: "speedster_ella",
    uid: "j6k7l8m9n0",
    firstname: "Ella",
    custom: { passion: "Running", record: "Marathon" },
    color: "#e67e22",
  },
  {
    username: "astro_john",
    uid: "o1p2q3r4s5",
    lastname: "Johnson",
    profileUrl: "https://avatar.iran.liara.run/public",
    custom: { bio: "Space Enthusiast", favPlanet: "Mars" },
    color: "#34495e",
  },
  {
    username: "fitness_fanatic",
    uid: "t6u7v8w9x0",
    firstname: "Nina",
    profileUrl: "https://avatar.iran.liara.run/public",
    custom: { activity: "Yoga", goal: "Well-being" },
    color: "#1abc9c",
  },
];



export default function TabOneScreen() {
  const navigation = useNavigation();
  const conversationRef = useRef<ConversationsRefs>();
  const { client, expoPushToken } = useClient();

  const chatUser =
    Platform.OS !== "android"
      ? { uid: "20", username: "mike", color: "green" }
      : {
          uid: "30",
          username: "timi",
          color: "blue",
          profileUrl:
            "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
        };

  useEffect(() => {
    if (client && expoPushToken) {
      console.log('should initialize')
      console.log(expoPushToken)
        client?.initializeUser(chatUser, { notificationConfig: { type: "expo", token: expoPushToken } });
    }
  }, [client, expoPushToken]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          router.navigate({
            pathname: "/(main)/two",
            params: {},
          });
        }}
        style={{ backgroundColor: "green", padding: 20 }}
      >
        <Text>Go to conversations</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          router.navigate({
            pathname: "/(main)/three",
            params: {
              chatUser: JSON.stringify(chatUser),
              activeConversation: JSON.stringify(store),
            },
          });
        }}
        style={{ backgroundColor: "red", padding: 20 }}
      >
        <Text>Go to chat</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          router.navigate({
            pathname: "/(main)/four",
            params: {
              chatUser: JSON.stringify(chatUser),
              activeConversation: JSON.stringify(store),
            },
          });
        }}
        style={{ backgroundColor: "indigo", padding: 20 }}
      >
        <Text style={{ color: 'white' }}>Go to broadcastlists</Text>
      </TouchableOpacity>
      {/* <SlateRenderer
        document={[
          {
            type: "paragraph",
            children: [
              {
                text: "The standard Lorem Ipsum passage, used since the 1500s",
                heading: true,
                underline: true,
              },
            ],
          },
          {
            type: "paragraph",
            children: [
              {
                text: '"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."',
                italic: true,
              },
            ],
          },
          { type: "paragraph", children: [{ italic: true, text: "" }] },
          {
            type: "paragraph",
            children: [
              {
                italic: true,
                text: 'Section 1.10.32 of "de Finibus Bonorum et Malorum", written by Cicero in 45 BC:',
                underline: true,
              },
            ],
          },
          {
            type: "paragraph",
            children: [
              {
                italic: true,
                text: '"Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"',
              },
            ],
          },
        ]}
      /> */}
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
