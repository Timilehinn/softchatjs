import React, { useState, useEffect, useRef, useCallback, CSSProperties } from "react";
// import "./audio-recorder.css";
import { PauseIcon, PlayIcon } from "../assets/icons";
import { convertToMinutes } from "../../helpers/date";
import { FaSpinner } from "react-icons/fa6";
import { useChatClient } from "../../providers/chatClientProvider";

type AudioPlayerProps = {
  blob: Blob;
  url?: string;
  duration: number;
  style?: CSSProperties
};
export default function AudioPlayer(props: AudioPlayerProps) {
  const { blob, duration, url, style } = props;

  const [audioUrl, setAudioUrl] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // Set default to true
  const { config } = useChatClient();
  const theme = config.theme;
  const textColor = config?.theme?.text?.primary || "white";

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleLoadedMetadata = () => {
    // if (audioRef.current) {
    // setDuration(audioRef.current.duration?? 0);
    // }
  };

  const handleTimeUpdate = () => {
    // if (audioRef.current) {
    setCurrentTime(audioRef.current.currentTime);
    // }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  useEffect(() => {
    if (url) {
      return setAudioUrl(url);
    }
    if (blob) {
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setIsLoading(true);
    }
  }, [blob, url]);

  const renderAction = useCallback(() => {
    if (isLoading) {
      return <FaSpinner style={{ marginRight: "3px", color:textColor} } />;
    }

    return (
      <button
        onClick={togglePlayPause}
        style={{
          backgroundColor: "transparent",
          border: 0,
          padding: 0,
          margin: '0px',
          marginTop: '4px'
        }}
      >
        {isPlaying ? (
          <PauseIcon size={15} color={textColor} />
        ) : (
          <PlayIcon size={15} color={textColor} />
        )}
      </button>
    );
  }, [isLoading, isPlaying]);

  return (
    <div style={{ display: "flex", alignItems: "center", padding: "5px", ...style }}>
      {renderAction()}
      <audio
        ref={audioRef}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        src={audioUrl}
      >
      </audio>
      <p style={{ padding: 0, marginLeft: "10px", marginTop: 0, fontSize: "11.5px", color: textColor }}>
        {convertToMinutes(currentTime)} : {convertToMinutes(duration)}
      </p>
    </div>
  );
}
