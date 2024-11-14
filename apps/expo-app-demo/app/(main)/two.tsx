import {
  StyleSheet,
  Platform,
  TouchableOpacity,
  Text,
  View,
  Button,
} from "react-native";
import { Conversations } from "softchatjs-react-native/src";
import { useNavigation, router } from "expo-router";
import { useRef } from "react";
import { ConversationsRefs } from "softchatjs-react-native/src/components/Conversations";
import { useClient } from "@/contexts/ClientContext";

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
  const { client } = useClient();
  const conversationRef = useRef<ConversationsRefs>();

  const chatUser =
    Platform.OS === "android"
      ? { uid: "100", username: "mike", color: "green" }
      : {
          uid: "30",
          username: "timi",
          color: "blue",
          profileUrl:
            "https://gravatar.com/avatar/582f9168aca439f2d795206bd5ba49ae",
        };

  return (
    <View style={styles.container}>
      <Conversations
        ref={conversationRef}
        user={chatUser}
        users={users}
        onOpen={({ activeConversation }) => {
          router.navigate({
            pathname: "/(main)/three",
            params: {
              chatUser: JSON.stringify(chatUser),
              activeConversation: JSON.stringify(activeConversation),
            },
          });
        }}
        renderPlaceHolder={({loading}) => {
          return (
            <Text>{ loading? 'Loading...' : "...not loading" }</Text>
          )
        }}
        // renderHeader={(props) => <View style={{ height: 60, width: '100%', backgroundColor: 'red' }}>
        //   <Text>{props.isConnecting? 'Connecting' : 'Connected'}</Text>
        // </View>}
        // renderItem={(data) => (
        //   <View style={{ height: 60, width: '100%', flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        //     <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        //       <View style={{ height: 60, width: 60, borderRadius: 60, backgroundColor: 'lightblue', marginEnd: 5 }}></View>
        //       <Text>{data.conversationDetails.title}</Text>
        //     </View>
        //     <Text>{data.conversationDetails.lastMessage?.message}</Text>
        //   </View>
        // )}
      />

      {/* <TouchableOpacity style={{ padding: 15, backgroundColor: 'red' }} onPress={() => conversationRef.current?.retryConnection()}>
        <Text>Retry</Text>
      </TouchableOpacity> */}
      <TouchableOpacity style={{ backgroundColor: 'red', padding: 10 }} onPress={() => client?.disconnect()}>
        <Text>Discounncc</Text>
      </TouchableOpacity>
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
