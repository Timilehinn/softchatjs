import React, { useEffect, useState } from "react";

import styles from "./avartar.module.css";
import { Message } from "softchatjs-core";
import Text from "../text/text";

// const Avartar = ({ message, url }: { message?: Message; url?: string }) => {
  const Avartar = ({ initials, url, size = 35  }: { initials: string, url?: string, size?: number }) => {
    if(!url){
      return (
    <div className={styles.avatar} style={{ height: size, width: size, borderRadius: size }}>
      <p style={{ fontSize: 35 * 0.5, fontWeight: 'bold', textTransform: 'capitalize' }}>
        {initials}
      </p>
    </div>
      )
    }

  return (
    <div className={styles.avatar}  style={{ height: size, width: size, borderRadius: size }}>
      <img src={url} alt="avatar" style={{ height: '100%', width: "100%", borderRadius: '100%' }} />
    </div>
  );
};

export default Avartar;
