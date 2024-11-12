import { useChatClient } from "@/src/providers/chatClientProvider";
import React, { useState, useEffect, useCallback } from "react";
import Avartar from "../avartar/avartar";
import { UserMeta } from "softchatjs-core";
import { BroadcastIcon, ChatIcon, ChatPlus } from "../assets/icons";
import "./navigation.css";
import { UserList } from "../user-conversations";
import { ConnectionStatus, useChatState } from "../../providers/clientStateProvider";

type View = "broadcast-lists" | "conversation-list";

export default function Navbar(props: {
  chatUser: UserMeta;
  activeView: View;
  userList: UserMeta[];
  onViewChanged: (view: View) => void;
  renderNavbar: () => JSX.Element;
  connectionStatus: ConnectionStatus,
}) {
  const { client, config } = useChatClient();
  const { setActiveConversation } = useChatState();
  
  const [menu, showMenu] = useState(false);

  const navButtons = [
    {
      label: "Chats",
      icon: <ChatIcon color={config.theme.icon} size={25} />,
      key: "conversation-list",
      onClick: () => { props.onViewChanged("conversation-list");  setActiveConversation(null) }
    },
    {
      label: "New chat",
      icon: <ChatPlus color={config.theme.icon} size={25} />,
      key: "new-chat",
      onClick: () => showMenu(true),
    },
    {
      label: "Broadcast lists",
      icon: <BroadcastIcon color={config.theme.icon} size={25} />,
      key: "broadcast-lists",
      onClick: () => { props.onViewChanged("broadcast-lists"); setActiveConversation(null) },
    },
  ];

  useEffect(() => {
    document.addEventListener("mousedown", () => showMenu(false));
  }, []);

  if (props.renderNavbar) {
    return <>{props.renderNavbar}</>;
  }

  const renderNavList = useCallback(() => {
    console.log(props.activeView);
    return (
      <>
        {navButtons.map((nav, i) => (
          <button
            key={i}
            className={`nav-btn`}
            style={{
              borderRight: 0,
              borderTop: 0,
              borderBottom: 0,
              borderLeft:
                props.activeView === nav.key
                  ? `2px solid ${config.theme.icon}`
                  : `2px solid ${config.theme.background.secondary}`,
            }}
            title={nav.label}
            onClick={() => props.connectionStatus.isConnected? nav.onClick() : null}
          >
            {nav.icon}
          </button>
        ))}
      </>
    );
  }, [navButtons, config.theme, props.activeView, props.connectionStatus]);
  

  return (
    <>
      <div
        style={{
          height: "100%",
          width: "50px",
          backgroundColor: config.theme.background.secondary,
          borderRight: `1px solid ${config.theme.divider}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "20px",
          justifyContent: "space-between",
        }}
      >
        <label title="Me">
          <Avartar
            url={props.chatUser.profileUrl}
            size={30}
            initials={props.chatUser.username.substring(0, 1)}
          />
        </label>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          {renderNavList()}
        </div>
      </div>
      {menu && (
        <UserList users={props.userList} userListRef={null} />
      )}
    </>
  );
}
