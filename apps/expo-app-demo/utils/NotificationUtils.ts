import Constants from "expo-constants";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("user-accounts", {
      name: "user-accounts",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
    await Notifications.setNotificationChannelAsync("bookings", {
      name: "bookings",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
    await Notifications.setNotificationChannelAsync("transactions", {
      name: "transactions",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
    await Notifications.setNotificationChannelAsync("reviews", {
      name: "reviews",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    // projectId from app.json
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: "a14d5830-4468-4260-afb1-baf27aaa6d6c",
      })
    ).data;
  } else {
    alert("Must use physical device for Push Notifications");
  }
  return token;
}

export function displayLocalPushNotification({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: null,
  });
}

// class NotificationUtils {

//     static async updateUserPushNotificationToken(){
//         let userPushNotificationToken: string | undefined | null = await AsyncStorage.getItem('pushNotificationToken');
//         if(userPushNotificationToken === null || userPushNotificationToken === undefined || userPushNotificationToken === ''){
//             userPushNotificationToken = await registerForPushNotificationsAsync();

//             if(userPushNotificationToken) {
//                 await AsyncStorage.setItem('pushNotificationToken', userPushNotificationToken);
//             }

//             const tokenSentStatus = await setUserPushNotificationToken(userPushNotificationToken)
//             return
//         }
//         userPushNotificationToken;
//         const tokenSentStatus = await setUserPushNotificationToken(userPushNotificationToken)
//         return
//     }

// }
