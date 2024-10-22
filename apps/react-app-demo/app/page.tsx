"use client";
import Image from "next/image";
import { Button } from "@repo/ui/button";
import styles from "./page.module.css";
import { Chat } from "softchatjs-react";

export default function Home() {
  return (
    <div className={styles.page}>
      <Chat
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
        //   <div style={{ height: "100%", width: "100%", background: "black" }}>
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
      />
    </div>
  );
}
