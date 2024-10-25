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
  closePanel:()=>void
};

const EditPanel = (props: EditPanelProps) => {
  const { isEditing, message, isReplying,closePanel } = props;
  const { config } = useChatClient();
  const { theme } = config;

  const primaryActionColor = theme?.action?.primary || "white";

  return (
    <div
      className={
        isEditing || isReplying
          ? `${styles.edit} ${styles.editOpen}`
          : `${styles.edit}`
      }
    >
      <div className={styles.edit__message}>
        <div style={{ width: "90%" }}>
          <Text text="You" weight="bold" />
          <Text text={message?.message} weight="medium" />
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
          color={primaryActionColor}
          size={20}
          style={{cursor:"pointer"}}
        />
      </div>
    </div>
  );
};

export default EditPanel;
