import React, { useEffect, useState } from "react";

import styles from "./avartar.module.css";
import { Message } from "softchatjs-core";
import Text from "../text/text";

// const Avartar = ({ message, url }: { message?: Message; url?: string }) => {
  const Avartar = ({ initials, url }: { initials: string, url?: string }) => {
    if(!url){
      return (
    <div className={styles.avatar}>
      <p style={{ fontSize: '20px', fontWeight: 'bold', textTransform: 'capitalize' }}>
        {initials}
      </p>
    </div>
      )
    }

  return (
    <div className={styles.avatar}>
      <img src={url} alt="avatar" style={{ flex: 1 }} />
    </div>
  );
};

export default Avartar;
