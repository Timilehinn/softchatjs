import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import BottomSheet, { BottomSheetRef } from "../../BottomSheet";
import { Colors } from "../../../constants/Colors";
import { forwardRef, useCallback, useEffect, useRef, useState, useImperativeHandle } from "react";
import { GET_EMOJIS } from "../../../api";
import { useConnection } from "../../../contexts/ConnectionProvider";
import { generateConversationId, generateFillerTimestamps, generateId } from "../../../utils";
import { KeyboardIcon, SearchIcon } from "../../../assets/icons";
import { useChatClient } from "../../../contexts/ChatClientContext";
import { AttachmentTypes, MediaType, Message, MessageStates, UserMeta } from "../../../types";
import Search from "../../Search";
import { FlashList } from "@shopify/flash-list";
import { useConfig } from "../../../contexts/ChatProvider";
import { useMessageState } from "../../../contexts/MessageStateContext";

type EmojiListProps = {
  openKeyboard: () => void;
  sendSticker: () => void;
  recipientId: string
};

export const EmojiSheet = forwardRef((props: EmojiListProps, ref: any) => {
  const emojiListRef = useRef<BottomSheetRef>();
  const { client, theme } = useConfig()
  const { openKeyboard, sendSticker, recipientId } = props;
  const flatListRef = useRef(null);
  const width = Dimensions.get("window").width;
  const emojiSize = 40;
  var noOfColumns = Math.floor(width / emojiSize);
  const [height, setHeight] = useState("45%");
  const [searchValue, setSearchValue] = useState("");
  const { stickers, setStickers, globalTextMessage, setGlobalTextMessage } = useMessageState();

  const closeSheet = () => {
    emojiListRef?.current?.close();
  };

  const openSheet = () => {
    emojiListRef?.current?.open();
  };

  const onClose = () => {
    setHeight("45%");
  };

  useImperativeHandle(ref, () => ({
    open: () => openSheet(),
    close: () => closeSheet(),
  }));

  useEffect(() => {
    (async() => {
      if(client){
        const userId = client?.userMeta.uid
        const conversationId = generateConversationId(userId as string, recipientId);
        const stickers = await client.messageClient(conversationId).getEmojiList();
        setStickers(stickers);
      }
    })()
  }, [client]);

  
    const renderItem = useCallback(({ item, index }: { item: any, index: number }) => {
      const userId = client?.userMeta.uid
      const conversationId = generateConversationId(userId as string, recipientId);
      const messageId = generateId();
      const newMessage: Message = {
        conversationId,
        from: userId as string,
        to: recipientId,
        message: globalTextMessage,
        messageState: MessageStates.LOADING,
        messageId,
        attachmentType: AttachmentTypes.STICKER,
        attachedMedia: [{
          type: MediaType.STICKER,
          ext: '',
          mediaId: '',
          mediaUrl: item.images.preview_gif.url,
        }],
        reactions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        messageOwner: {
          uid: userId as string,
          id: userId as string,
          connectionId: "--",
          projectId: client?.projectId as string,
          meta: client?.userMeta as UserMeta,
          ...generateFillerTimestamps(),
        },
      };

    return (
      <TouchableOpacity
        key={index}
        onPress={() => {
          console.log(newMessage.attachedMedia[0]);
          if(client){
            client.messageClient(newMessage.conversationId).sendMessage(newMessage)
          }
          setGlobalTextMessage('');
          closeSheet();
        }}
        style={{
          height: emojiSize,
          minWidth: emojiSize,
          alignItems: "center",
          margin: .7,
          flex: 1,
          justifyContent: "center",
          borderRadius: emojiSize
        }}
      >
        <Image
          source={{ uri: item.images.preview_gif.url }}
          style={{ height: 40, width: 40 }}
          cachePolicy="disk"
        />
      </TouchableOpacity>
    );
  }, [recipientId, client]);

  var filtered_emojis = stickers.filter((data: Emoticon) => {
    return data.title.toLowerCase()?.indexOf(searchValue.toLowerCase()) !== -1;
  });

  const emoji_list = filtered_emojis.length > 0 ? filtered_emojis : stickers;

  return (
    <BottomSheet
      ref={emojiListRef}
      onClose={onClose}
      scrollRef={flatListRef}
      height={height}
    >
      <View
        style={{
          flex: 1,
          height: "100%",
          width: "100%",
          justifyContent: "center",
          
        }}
      >
        <View
          style={{
            marginTop: 25,
            marginBottom: 10,
          }}
        >
          {height === "80%" ? (
            <Search 
                value={searchValue}
                setValue={setSearchValue}
                placeholder="Find stickers"
                containerStyle={{ paddingHorizontal: 10 }}
            />
          ) : (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 10,
              }}
            >
              <TouchableOpacity
                style={{ padding: 10 }}
                onPress={() => {
                  closeSheet();
                  setTimeout(() => {
                    setHeight("80%");
                    openSheet();
                  }, 300);
                }}
              >
                <SearchIcon color={theme?.text.secondary} />
              </TouchableOpacity>
              <Text style={{ fontSize: 25, color: theme?.text.secondary }}>Stickers</Text>
              <TouchableOpacity
                style={{ padding: 10 }}
                onPress={() => {
                  closeSheet();
                  setTimeout(() => {
                    setHeight("45%");
                    openKeyboard();
                  }, 300);
                }}
              >
                <KeyboardIcon size={30} color={theme?.text.secondary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View
          style={{
            height: "90%",
            width: "100%",
          }}
        >
          <FlashList
            ref={flatListRef}
            numColumns={noOfColumns}
            data={emoji_list}
            estimatedItemSize={1800}
            renderItem={renderItem}
            ListFooterComponent={() => <View style={{ height: 100 }} />}
          />
        </View>
      </View>
    </BottomSheet>
  );
})

export default EmojiSheet