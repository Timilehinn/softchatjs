"use client";
import styles from "./page.module.css";
import { Chat } from "softchatjs-react/src";
// import "softchatjs-react/dist/index.css"
import { useAppProvider } from "./context/AppProvider";
import { useEffect, useState } from "react";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import usePushNotification from "./hooks/usePushNotification";
import { app } from "./firebase";



export default function Home() {
  const { webToken } = usePushNotification();
  // const messaging = getMessaging(app);

  // useEffect(() => {
  //   onMessage(messaging, (payload) => {
  //     console.log(payload, ":::payload:::")
  //   })
  // },[ messaging ])

  useEffect(() => {
    if (navigator !== undefined) {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .register("/firebase-messaging-sw.js")
          .then((registration) => {
            console.log(
              "Service Worker registered with scope:",
              registration.scope
            );
          })
          .catch((error) => {
            console.error("Service Worker registration failed:", error);
          });
      }
    }
  }, []);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
        <Chat
          // headerHeightOffset={50}
          // activeConversationId="800d38f9b61a902c"
          webToken={webToken}
          user={{
            uid: "30",
            username: "makaveli96",
            profileUrl:
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiBNx0Gn_wuUhj9u7ncTMf31YGgCg9JBM3Hg&s",
          }}
          userList={[
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
          ]}
          // renderChatBubble={(message) => (
          //   <div style={{ padding: "40px",  }}>
          //     {message.message}
          //   </div>
          // )}
          // renderChatInput={({ onChange }) => (
          //   <input
          //     onChange={(e) => {
          //       onChange(e.target.value);
          //     }}
          //     style={{ height: "40px", width: "100%", background: "green" }}
          //   />
          // )}
          // renderChatHeader={() => (
          //   <div style={{ height: "100%", background: "green",width:"100%" }}></div>
          // )}
          // renderConversationList={({ conversations, onCoversationItemClick }) => (
          //   <div style={{ height: "100%", width: "100%" }}>
          //     {conversations.map((item) => (
          //       <div>
          //         <p
          //           onClick={() => {
          //             onCoversationItemClick(item);
          //           }}
          //           style={{ color: "white", background: "red" }}
          //         >
          //           {item.lastMessage.message}
          //         </p>
          //       </div>
          //     ))}
          //   </div>
          // )}
          //  renderChatHeader={() => (
          //   <div style={{ height: "100%", background: "green",width:"100%" }}></div>
          // )}
          // renderAddConversationIcon={() => (
          //   <div
          //     style={{
          //       height: "40px",
          //       width: "40px",
          //       background: "blue",
          //       borderRadius: "100%",
          //     }}
          //   ></div>
          // )}
        />
    </div>
  );
}
