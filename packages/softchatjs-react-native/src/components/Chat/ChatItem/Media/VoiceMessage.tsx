import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useCallback, useMemo } from "react";
import { PauseIcon, PlayIcon } from "../../../../assets/icons";
import { convertToMinutes } from "../../../../utils";
import { useConfig } from "../../../../contexts/ChatProvider";
import { Media } from "softchatjs-core";
import { useMessageState } from "softchatjs-react-native/src/contexts/MessageStateContext";
import theme from "softchatjs-react-native/src/theme";

type VoiceMessageProps = {
  media: Media;
  textColor?: string;
};

var generateDefaultAudioMeterings = () => {
  const ui: { [key: number]: { metering: number; height: number } } = {};
  for (let i = 1; i <= 50; i++) {
    ui[i] = {
      metering: -50,
      height: 10,
    };
  }
  return ui;
};

export const AudioWaves = ({
  type = "record",
  audioTime,
  audioWaves,
}: {
  type: "play" | "record";
  audioTime: number;
  audioWaves: { [key: number]: { metering: number; height: number } };
}) => {
  const { theme } = useConfig();

  const waves = Object.values(audioWaves).flat();

  return (
    <View
      style={{
        flex: 1,
        marginHorizontal: 5,
        borderWidth: type === "record" ? 1 : 0,
        overflow: "hidden",
        borderColor: theme?.divider,
        borderRadius: 100,
        paddingHorizontal: 10,
        height: 35,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: type === "play" ? theme?.text.primary : "white",
          fontSize: 12,
          marginEnd: 5,
        }}
      >
        {convertToMinutes(Number(audioTime.toFixed(0)))}
      </Text>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          height: "100%",
          justifyContent: type === "play" ? "flex-start" : "flex-end",
          overflow: "hidden",
          paddingHorizontal: 0,
        }}
      >
        {waves.map((wave, i) => (
          <View
            key={i}
            style={{
              width: 2,
              backgroundColor: theme?.icon,
              height: `${wave.height}%`,
              marginEnd: 2,
              borderRadius: 1,
            }}
          />
        ))}
      </View>
    </View>
  );
};

export default function VoiceMessage(props: VoiceMessageProps) {
  const { media, textColor = theme.text.primary } = props;
  const {
    sound,
    audioState,
    playVoiceMessage,
    pauseVoiceMessage,
    resumeVoiceMessage,
    unload,
    activeVoiceMessage,
    avPlayBackStatus,
  } = useMessageState();

  const renderVoiceMessageControls = useCallback(() => {
    var isActiveVoiceMessage = media.mediaId === activeVoiceMessage?.mediaId;
    if (isActiveVoiceMessage && audioState === "loading") {
      return <ActivityIndicator size={25} />;
    } else if (isActiveVoiceMessage && audioState === null) {
      return (
        <TouchableOpacity onPress={() => playVoiceMessage(media)}>
          <PlayIcon color={theme?.icon} />
        </TouchableOpacity>
      );
    } else if (isActiveVoiceMessage && audioState === "playing") {
      return (
        <TouchableOpacity onPress={pauseVoiceMessage}>
          <PauseIcon color={theme?.icon} />
        </TouchableOpacity>
      );
    } else if (isActiveVoiceMessage && audioState === "paused") {
      return (
        <TouchableOpacity onPress={resumeVoiceMessage}>
          <PlayIcon color={theme?.icon} />
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity onPress={() => playVoiceMessage(media)}>
          <PlayIcon color={theme?.icon} />
        </TouchableOpacity>
      );
    }
  }, [media, activeVoiceMessage, audioState]);

  var progress = useMemo(() => {
    try {
      var isActiveVoiceMessage = media.mediaId === activeVoiceMessage?.mediaId;
      if (isActiveVoiceMessage) {
        if (audioState === null || audioState === "loading") {
          return {
            percentage: 0,
            timePlayed: media?.meta?.audioDurationSec ?? 0 / 1000,
          };
        }
        var curr = avPlayBackStatus?.positionMillis / 1000;
        var duration = media?.meta?.audioDurationSec ?? 0 / 1000;
        var percentage = (curr / duration) * 100;
        return { percentage, timePlayed: curr };
      }
      return { percentage: 0, timePlayed: media.meta?.audioDurationSec ?? 0 };
    } catch (error) {
      return { percentage: 0, timePlayed: media.meta?.audioDurationSec ?? 0 };
    }
  }, [media, avPlayBackStatus, audioState]);

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
      }}
    >
      <>{renderVoiceMessageControls()}</>
      <View
        style={{
          flex: 1,
          height: 3,
          backgroundColor: theme?.divider,
          marginHorizontal: 10,
        }}
      >
        <View
          style={{
            width: `${progress.percentage}%`,
            maxWidth: "100%",
            height: 3,
            backgroundColor: theme?.icon,
          }}
        />
      </View>
      <Text style={{ marginStart: 5, color: textColor }}>
        {convertToMinutes(progress.timePlayed)}
      </Text>
    </View>
  );
}
