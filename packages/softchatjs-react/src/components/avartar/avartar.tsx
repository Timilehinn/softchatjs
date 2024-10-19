import { useEffect, useState } from "react";

import styles from "./avartar.module.css";
import { Message } from "softchatjs-core";

const Avartar = ({ message, url }: { message?: Message; url?: string }) => {
  
  return (
    <div className={styles.avatar}>
      <img src={message?.messageOwner?.profileUrl || url} alt="" />
    </div>
  );
};

export default Avartar;
