"use client";
import styles from "./page.module.css";
import { Chat } from "softchatjs-react/src";
// import "softchatjs-react/dist/index.css"
import { useAppProvider } from "./context/AppProvider";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import usePushNotification from "./hooks/usePushNotification";
import { app } from "./firebase";

let CHAT_HEIGHT = 700;
let CHAT_WIDTH = 350;
let CHAT_OFFSET = 0;

export default function Home() {
  const { webToken } = usePushNotification();
  const [isVisible, setIsVisible] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  var closedPos = `translateY(${CHAT_OFFSET}px)`;
  var openPos = `translateY(${CHAT_HEIGHT - CHAT_OFFSET}px)`;
  // const messaging = getMessaging(app);

  // useEffect(() => {
  //   onMessage(messaging, (payload) => {
  //     console.log(payload, ":::payload:::")
  //   })
  // },[ messaging ])
  const chatContainerY = useRef(CHAT_HEIGHT);

  const showChatContainer = () => {
    // setIsVisible((prev) => !prev);
    if (chatContainerRef.current) {
      console.log(chatContainerRef.current.style.transform);
      if (chatContainerRef.current.style.transform === closedPos) {
        chatContainerRef.current.style.transform = openPos;
      } else {
        chatContainerRef.current.style.transform = closedPos;
      }
    }
  };

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

  const MainChat = useCallback(() => {
    console.log("what??");
    return (
      <Chat
        height={CHAT_HEIGHT}
        width={CHAT_WIDTH}
        webToken={webToken}
        enableBroadcasts={false}
        user={{
          uid: "30",
          username: "makaveli96",
          profileUrl:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiBNx0Gn_wuUhj9u7ncTMf31YGgCg9JBM3Hg&s",
        }}
      />
    );
  }, []);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      {/* <main style={{ position: 'fixed', bottom: "0", right: '20px' }}> */}
      <main
        ref={chatContainerRef}
        style={{
          position: "fixed",
          bottom: 0,
          right: "5px",
          transition: "transform 0.4s ease-in-out",
          transform: closedPos,
        }}
      >
        <div
          onClick={showChatContainer}
          style={{
            width: `${CHAT_WIDTH}px`,
            height: "35px",
            backgroundColor: "lightblue",
            borderTopRightRadius: "10px",
            borderTopLeftRadius: "10px",
          }}
        >
          <p>Live chat</p>
        </div>
        <MainChat />
      </main>
    </div>
  );
}
