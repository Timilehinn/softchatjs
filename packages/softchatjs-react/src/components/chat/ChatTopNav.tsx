import React from 'react'
import { ConversationListItem, Message } from 'softchatjs-core';
import { useChatClient } from '../../providers/chatClientProvider';
import styles from "./chat.module.css";
import { MdOutlineClose, MdOutlineMenu } from 'react-icons/md';
import Avartar from '../avartar/avartar';
import { useChatState } from '../../providers/clientStateProvider';

export const ChatTopNav = ({
  setMainListOpen,
  renderChatHeader,
  onClose,
}: {
  setMainListOpen: any;
  renderChatHeader?: () => JSX.Element;
  onClose: () => void;
}) => {
  const { client, config } = useChatClient();
  const { activeConversation, setActiveConversation } = useChatState();
  const { theme } = config;

  const conversationTitle = () => {
    try {
      const participantList = activeConversation.conversation.participantList;
      const data = participantList.filter(p => p.participantDetails.uid !== client.userMeta.uid)
      return {
        profileUrl: data[0].participantDetails.profileUrl,
        title: data[0].participantDetails.firstname || data[0].participantDetails.username,
      }
    } catch (error) {
      return   {
        profileUrl: "https://avatar.iran.liara.run/public",
        title: 'No name'
      }
    }
  }

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
          <Avartar initials={conversationTitle().title.substring(0,1)} url={conversationTitle().profileUrl} />
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
