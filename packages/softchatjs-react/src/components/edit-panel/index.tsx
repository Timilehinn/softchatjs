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
        <Text text="You" weight="bold" />
        <Text text={message?.message} weight="medium" />
      </div>
    </div>
  );
};

export default EditPanel;
