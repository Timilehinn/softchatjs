"use client";
import styles from "./page.module.css";
import { Chat } from "softchatjs-react/src";
// import "softchatjs-react/dist/index.css"
import { useAppProvider } from "./context/AppProvider";
import { useEffect } from "react";

export default function Home() {
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <div style={{ height: '50px', width: '100%', backgroundColor: 'red' }} />
      <Chat
      headerHeightOffset={50}
        user={{
          uid: "30",
          username: "makaveli96",
          profileUrl:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiBNx0Gn_wuUhj9u7ncTMf31YGgCg9JBM3Hg&s",
        }}
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
