import React from 'react'
import { Message } from 'softchatjs-core';
import { useChatClient } from '../../providers/chatClientProvider';
import styles from "./chat.module.css";
import { MdOutlineClose, MdOutlineMenu } from 'react-icons/md';
import Avartar from '../avartar/avartar';
import { useChatState } from '../../providers/clientStateProvider';

export const ChatTopNav = ({
  message,
  setMainListOpen,
  renderChatHeader,
  onClose
}: {
  message: Message;
  setMainListOpen: any;
  renderChatHeader?: () => JSX.Element;
  onClose: () => void;
}) => {
  const { client, config } = useChatClient();
  const { setActiveConversation } = useChatState();
  const { theme } = config;

  return (
    <div
      style={{ backgroundColor: theme?.background?.secondary || "#222529" }}
      className={styles.topnav}
    >
      {renderChatHeader ? (
        renderChatHeader()
      ) : (
        <div
          style={{ paddingLeft: "10px", display: "flex", justifyContent: 'space-between', width: "100%", padding: '15px', alignItems: "center" }}
        >
          <Avartar initials={message.messageOwner.username.substring(0,1)} url={message.messageOwner.profileUrl} />
          <div className={styles.topnav__menu} style={{  }}>
            <MdOutlineClose
              color={theme?.icon}
              onClick={() => {
                setMainListOpen(true);
                setActiveConversation(null);
                onClose()
              }}
              size={22}
            />
          </div>
        </div>
      )}
    </div>
  );
};
