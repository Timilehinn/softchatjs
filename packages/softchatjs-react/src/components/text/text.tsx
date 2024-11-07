import React from "react";
import styles from "./text.module.css";

type TextProps = {
  text: string;
  styles?: React.CSSProperties | undefined;
  weight?: "bold" | "medium";
  size?: "sm" | "md" | "xs";
};

const Text = (props: TextProps) => {
  const textWeight = {
    bold: styles.textBold,
    medium: `${styles.textMedium}`,
  };

  const textSize: any = {
    sm: styles.textSmall,
    md: styles.textSizeMd,
    xs: styles.textExtraSmall,
  };

  return (
    <p
      style={props.styles}
      className={`${styles.text} ${textWeight[props.weight || "medium"]} ${
        textSize[props.size || "md"]
      }`}
    >
      {props.text}
    </p>
  );
};

export default Text;
