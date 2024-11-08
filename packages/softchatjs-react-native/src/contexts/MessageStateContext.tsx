import React, {
  createContext,
  useState,
  useContext,
} from "react";
import {
  SetState,
} from "../types";
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Emoticon, Message, SendMessageGenerics, Media, UserMeta } from "softchatjs-core";
import defaultUser from "../constants/DefaultUser";

type MessageStateContext = {
  globalTextMessage: string,
  setGlobalTextMessage: SetState<string>,
  stickers: Emoticon[],
  setStickers: SetState<Emoticon[]>,
  pendingMessages: Array<Partial<Message>>,
  addNewPendingMessages: (message: Partial<Message>) => void;
  removePendingMessage: (messageId: string) => void;
  updatePendingMessage: (messageId: string, message: Message) => void;
  playVoiceMessage: (media: Media) => void;
  pauseVoiceMessage: () => void;
  resumeVoiceMessage: () => void;
  audioState: "playing" | "paused" | "loading" | null,
  unload: () => void;
  sound: Audio.Sound | null,
  activeVoiceMessage: Media | null,
  avPlayBackStatus: AVPlaybackStatus & { positionMillis: number } | null,
  userMeta: UserMeta,
  setUserMeta: SetState<UserMeta>
};

const initialMessageStateContext: MessageStateContext = {
  globalTextMessage: '',
  setGlobalTextMessage: () => {},
  stickers: [],
  setStickers: () => {},
  pendingMessages: [],
  addNewPendingMessages: (message: Partial<Message>) => {},
  removePendingMessage: (messageId: string) => {},
  updatePendingMessage: (messageId: string, message: Message) => {},
  playVoiceMessage: (media: Media) => {},
  pauseVoiceMessage: () => {},
  resumeVoiceMessage: () => {},
  audioState: null,
  unload: () => {},
  sound: null,
  activeVoiceMessage: null,
  avPlayBackStatus: null,
  userMeta: defaultUser,
  setUserMeta: () => {}
}

export default initialMessageStateContext;

const MessageStateContext = createContext<MessageStateContext>(
  initialMessageStateContext
);
export const useMessageState = () => useContext(MessageStateContext);

export const MessageStateProvider = ({ children }: { children: JSX.Element }) => {
 
  const [ globalTextMessage, setGlobalTextMessage ] = useState('');
  const [ stickers, setStickers ] = useState<Emoticon[]>([]);
  const [ pendingMessages, setPendingMessages ] = useState<Array<Partial<Message>>>([]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [ audioState, setAudioState ] = useState<"playing" | "paused" | "loading" | null>(null);
  const [ activeVoiceMessage, setActiveVoiceMessage ] = useState<Media | null>(null);
  const [ avPlayBackStatus, setAvPlayBackStatus ] = useState<AVPlaybackStatus & { positionMillis: number } | null>(null);
  const [ userMeta, setUserMeta ] = useState<UserMeta>(defaultUser)

  const addNewPendingMessages = (message: Partial<Message>) => {
    setPendingMessages((prev) => {
      return [ ...prev, message ]
    });
  }

  const removePendingMessage = (messageId: string) => {
    setPendingMessages((prev) => {
      const filtered = prev.filter(m => m.messageId !== messageId)
      return filtered
    });
  }

  const updatePendingMessage = (messageId: string, updatedMessage: Message) => {
    const clonedMessage = JSON.parse(JSON.stringify(updatedMessage));
  
    setPendingMessages((prev) =>
      prev.map((message) =>
        message.messageId === messageId ? { ...message, ...clonedMessage } : message
      )
    );
  };
  
  
  const onPlaybackStatusUpdate = (data: AVPlaybackStatus & { didJustFinish: boolean , positionMillis: number}) => {
    setAvPlayBackStatus(data)
    if(data?.didJustFinish){
      setAudioState(null);
      unload();
    }
  };
  
  const playVoiceMessage = async (media: Media) => {
      if (activeVoiceMessage !== null && media.mediaId !== activeVoiceMessage?.mediaId) {
        return unload()
      }
  
    // if (sound && (audioState === 'playing' || audioState === 'paused') && media.mediaId !== activeVoiceMessage?.mediaId) {
    //   unload();
    // }
  
    setActiveVoiceMessage(media);
    setAudioState("loading");
  
    try {
      console.log('Loading Sound');
      const { sound: avSound } = await Audio.Sound.createAsync({ uri: media.mediaUrl }, {}, onPlaybackStatusUpdate);
      
      setSound(avSound);
  
      console.log('Playing Sound');
      setAudioState("playing");
      await avSound.playAsync();
    } catch (error) {
      console.error("Error loading audio: ", error);
      setAudioState(null);  
    }
  };
  

  const pauseVoiceMessage = async () => {
    await sound?.pauseAsync();
    setAudioState("paused")
  }

  const resumeVoiceMessage = async () => {
    if(audioState === "paused"){
      await sound?.playAsync();
      setAudioState("playing")
    }
  }

  const unload = () => {
    console.log('Unloading Sound');
    sound?.stopAsync();
    sound?.unloadAsync();
    setSound(null);
    setActiveVoiceMessage(null);
    setAudioState(null)
  }

  return (
    <MessageStateContext.Provider
      value={{
        globalTextMessage,
        setGlobalTextMessage,
        stickers,
        setStickers,
        pendingMessages, 
        addNewPendingMessages,
        removePendingMessage,
        updatePendingMessage,
        playVoiceMessage,
        pauseVoiceMessage,
        resumeVoiceMessage,
        audioState,
        unload,
        sound,
        activeVoiceMessage,
        avPlayBackStatus,
        userMeta,
        setUserMeta
      }}
    >
      {children}
    </MessageStateContext.Provider>
  );
};
