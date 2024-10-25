import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import styles from "./menu.module.css";
import { HiPhoto } from "react-icons/hi2";
import Text from "../text/text";

type MenuProps = {
  element: JSX.Element;
  generalMenuRef: any;
};

export const Menu = (props: MenuProps) => {
  return (
    <div ref={props.generalMenuRef} className={styles.menu}>
      {props.element}
    </div>
  );
};

export const AttachmentMenu = ({
  onChange,
  setFiles,
  closeGeneralMenu,
}: {
  onChange?: (event: any) => void;
  closeGeneralMenu: () => void;
  setFiles:Dispatch<SetStateAction<any[]>>
}) => {
  const fileInputRef: any = useRef();
  const options = [
    {
      icon: <HiPhoto size={24} color="white" />,
      title: "Photo",
    },
  ];

  const handleChange = (event: any) => {
    closeGeneralMenu();
    const files = event.target.files;
    setFiles(Array.from(files))
  };

  return (
    <div className={styles.attachment}>
      {options.map((item, index) => (
        <label htmlFor="upload">
          <div className={styles.attachment__item}>
            <div style={{ marginRight: "10px" }}> {item.icon}</div>
            <input
              onChange={handleChange}
              multiple
              ref={fileInputRef}
              type="file"
              hidden
              id="upload"
            />
            <Text
              styles={{ marginBottom: "3px" }}
              size="sm"
              text={item.title}
            />
          </div>
        </label>
      ))}
    </div>
  );
};
