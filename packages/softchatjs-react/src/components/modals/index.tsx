import { useChatState } from "../../providers/clientStateProvider";
import styles from "./image.module.css";
import { GrNext, GrPrevious } from "react-icons/gr";
import { useState } from "react";
import { LiaTimesSolid } from "react-icons/lia";

export const ImageViewer = () => {
  const { showImageModal, setShowImageModal } = useChatState();
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <div className={styles.images}>
      <LiaTimesSolid
        color="white"
        size={35}
        onClick={() => {
          setShowImageModal([]);
        }}
        style={{ position: "absolute", top: "20px", right: "20px" }}
      />
      <div className={styles.images__prev}>
        {activeIndex === 0 ? null : (
          <div style={{ padding: "10px" }}>
            <GrPrevious
              onClick={() => {
                return setActiveIndex(activeIndex - 1);
              }}
              color="white"
              size={35}
              style={{ cursor: "pointer" }}
            />
          </div>
        )}
      </div>
      <div className={styles.images__center}>
        <div className={styles.images__center__items}>
          <img
            onClick={(e) => {
              e.stopPropagation();
            }}
            src={showImageModal[activeIndex].mediaUrl}
            alt=""
          />
        </div>
      </div>
      <div className={styles.images__next}>
        {activeIndex === showImageModal.length - 1 ? null : (
          <div style={{ padding: "10px" }}>
            <GrNext
              onClick={() => {
                return setActiveIndex(activeIndex + 1);
              }}
              color="white"
              size={35}
              style={{ cursor: "pointer" }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
