import React, { useEffect, useState } from "react";

import styles from "./avartar.module.css";
import { Message } from "softchatjs-core";
import Text from "../text/text";
import { useChatClient } from "../../providers/chatClientProvider";

const Avartar = ({
  initials,
  url,
  size = 35,
}: {
  initials: string;
  url?: string;
  size?: number;
}) => {
  const { client, config } = useChatClient();

  if (!url) {
    return (
      <div
        className={styles.avatar}
        style={{ height: size, width: size, borderRadius: size, backgroundColor: config.theme.background.disabled }}
      >
        <p
          style={{
            fontSize: 35 * 0.5,
            fontWeight: "bold",
            textTransform: "capitalize",
            color: config.theme.text.secondary
          }}
        >
          {initials}
        </p>
      </div>
    );
  }

  return (
    <div
      className={styles.avatar}
      style={{ height: size, width: size, borderRadius: size }}
    >
      <img
        src={url}
        alt="avatar"
        style={{ height: "100%", width: "100%", borderRadius: "100%" }}
      />
    </div>
  );
};

export default Avartar;
