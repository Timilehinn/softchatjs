import { useEffect, useRef, useState } from "react";

import styles from "./edit.module.css";
import Text from "../text/text";
import { Message } from "softchatjs-core";
import { AiOutlineClose } from "react-icons/ai";
import { useChatClient } from "../../providers/chatClientProvider";

type EditPanelProps = {
  message: Message;
  isEditing?: boolean;
  isReplying?: boolean;
  closePanel: () => void;
};

const EditPanel = (props: EditPanelProps) => {
  const { isEditing, message, isReplying, closePanel } = props;
  const { config } = useChatClient();
  const { theme } = config;

  const secondaryColor = theme?.background?.secondary;
  const textColor = theme?.text?.primary;
  const iconColor = theme?.icon;

  return (
    <div
      className={
        isEditing || isReplying
          ? `${styles.edit} ${styles.editOpen}`
          : `${styles.edit}`
      }
      style={{ background: secondaryColor || "#1b1d21" }}
    >
      <div
        style={{ background: secondaryColor || "#222529" }}
        className={styles.edit__message}
      >
        <div style={{ width: "90%" }}>
          <Text text="You" styles={{ color: textColor }} weight="bold" />
          <Text
            text={message?.message}
            styles={{ color: textColor }}
            weight="medium"
          />
        </div>

        <div style={{ width: "10%" }}>
          {message?.attachedMedia[0]?.mediaUrl && (
            <img
              style={{ height: "100%", width: "100%", borderRadius: "5px" }}
              src={message?.attachedMedia[0]?.mediaUrl}
              alt=""
            />
          )}
        </div>
        <AiOutlineClose
          onClick={closePanel}
          color={iconColor}
          size={20}
          style={{ cursor: "pointer" }}
        />
      </div>
    </div>
  );
};

export default EditPanel;
