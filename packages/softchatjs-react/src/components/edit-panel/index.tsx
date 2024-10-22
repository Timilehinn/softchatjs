import { useEffect, useRef, useState } from "react";

import styles from "./edit.module.css";
import Text from "../text/text";
import { Message } from "softchatjs-core";

type EditPanelProps = {
  message: Message;
  isEditing?: boolean;
  isReplying?: boolean;
};

const EditPanel = (props: EditPanelProps) => {
  const { isEditing, message, isReplying } = props;

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
          <img
            style={{ height: "100%", width: "100%",borderRadius:'5px' }}
            src={message?.attachedMedia[0]?.mediaUrl}
            alt=""
          />
        </div>
      </div>
    </div>
  );
};

export default EditPanel;
