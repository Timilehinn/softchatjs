import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Avartar from "../avartar/avartar";

import styles from "./options-panel.module.css";
import Text from "../text/text";
import ChatClient, { Message } from "softchatjs-core/src";

type ConversationListProps = {
  message: Message;
  setEditDetails: Dispatch<
    SetStateAction<
      | { message: Message; isEditing?: boolean; isReplying?: boolean }
      | undefined
    >
  >;
  canEdit?: boolean;
  openEmojiPanel: () => void;
  optionsMenuRef: any;
  mousePosition: {
    x: number;
    y: number;
  };
  conversationId: string;
  client: ChatClient;
  closeOptionsMenu: () => void;
  textInputRef: any;
};

const OptionsPanel = (props: ConversationListProps) => {
  const {
    setEditDetails,
    message,
    canEdit,
    openEmojiPanel,
    optionsMenuRef,
    mousePosition: position,
    client,
    conversationId,
    closeOptionsMenu,
    textInputRef,
  } = props;

  const options = [
    {
      title: "Edit message",
      onPress: () => {
        setEditDetails({
          message,
          isEditing: true,
        });
        closeOptionsMenu();
      },
      enabled: canEdit,
    },

    {
      title: "Reply",
      onPress: () => {
        setEditDetails({
          message,
          isReplying: true,
        });
        closeOptionsMenu();
        textInputRef.current?.focus();
      },
      enabled: true,
    },
    {
      title: "Add reaction",
      onPress: () => {
        console.log("react");
        openEmojiPanel();
      },
      enabled: true,
    },
    {
      title: "Delete",
      onPress: () => {
        const msClient = client.messageClient(conversationId);
        msClient.deleteMessage(message.messageId, message.to, conversationId);
      },
      enabled: canEdit,
    },
  ];

  return (
    <div ref={optionsMenuRef} className={`${styles.options}`}>
      <ul>
        {options.map((item, index) => {
          if (item.enabled) {
            return (
              <li key={index} onClick={item.onPress}>
                <Text size="sm" text={item.title} />
              </li>
            );
          }
        })}
      </ul>
    </div>
  );
};

export default OptionsPanel;
