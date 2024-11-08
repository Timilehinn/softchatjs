import React, {
  Dispatch,
  Ref,
  SetStateAction,
  createRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
  forwardRef,
} from "react";
import styles from "./conversation-list.module.css";
import ChatClient, { Message } from "softchatjs-core";
import { Conversation, TypingIndicator } from "../conversation";
import Text from "../text/text";
import { formatSectionTime } from "../../helpers/date";
import { useChatState } from "../../providers/clientStateProvider";
import Avartar from "../avartar/avartar";
import { useChatClient } from "../../providers/chatClientProvider";
import { MdOutlineMenu } from "react-icons/md";
import moment from "moment";

type MessageListProps = {
  messages: Message[];
  setEditDetails: Dispatch<
    SetStateAction<
      | { message: Message; isEditing?: boolean; isReplying?: boolean }
      | undefined
    >
  >;
  recipientTyping?: boolean;
  mousePosition: {
    x: number;
    y: number;
  };
  client: ChatClient | null;
  conversationId: string;
  textInputRef: any;
  setPresentPage: Dispatch<SetStateAction<number>>;
  presentPage: number;
  setMainListOpen: any;
  recipientId: string;
  scrollToKey: string;
  fetchingMore: boolean;
  messagesEndRef: any;
  renderChatBubble?: (message: Message) => JSX.Element;
  renderChatHeader?: () => JSX.Element;
  headerHeightOffset: number;
  getOlderMessages: (func: () => void) => void;
};

const MessageList = (props: MessageListProps) => {
  const {
    messages = [],
    setEditDetails,
    recipientTyping,
    mousePosition,
    conversationId,
    client,
    textInputRef,
    setPresentPage,
    presentPage,
    recipientId,
    scrollToKey,
    fetchingMore,
    messagesEndRef,
    renderChatBubble,
    renderChatHeader,
    headerHeightOffset,
    getOlderMessages
  } = props;

  const ref = useRef<HTMLDivElement>()
  const [showOptions, setShowOPtions] = useState(false);
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const [activeIndex, setActiveIndex] = useState("");
  const [quoteId, setQuoteId] = useState("");
  const optionsMenuRef: any = useRef(null);
  const emojiPickerRef: any = useRef(null);
  // const ref: any = useRef<HTMLDivElement>(null);
  const [refMap, setRefMap] = useState<{ [key: string]: any }>({});
  const { activeConversation } = useChatState();
  const { config } = useChatClient();
  const [messagesPrepared, setMessagesPrepared] = useState(false);

  const itemRefs = useRef<Record<string, HTMLDivElement>>({});
  const theme = config.theme;
  const textColor = config?.theme?.text?.primary || "white";
  var scrollDebounce: NodeJS.Timeout | null = null

  function calculateHeight() {
    // Get the viewport height in pixels
    const viewportHeight = window.innerHeight;
  
    // Fixed pixel values in the calculation
    const fixedOffset1 = 80;
    const fixedOffset2 = 60;
  
    // Perform the calculation: (100vh - 80px - 60px - headerHeightOffset)
    const result = viewportHeight - fixedOffset1 - fixedOffset2 - headerHeightOffset;
  
    return result; // This gives you the pixel value of the calculation
  }

  const handlePress = (event: any, id: string) => {
    event.preventDefault();
    setShowEmojiPanel(false);
    setShowOPtions(true);
    setActiveIndex(id);
  };

  const closeOpenMenus = (e: any) => {
    if (showOptions && !optionsMenuRef.current?.contains(e.target)) {
      setShowOPtions(false);
    }
    if (showEmojiPanel && !emojiPickerRef.current?.contains(e.target)) {
      setShowEmojiPanel(false);
    }
  };

  const openEmojiPanel = (id: string) => {
    setShowEmojiPanel(true);
    setActiveIndex(id);
  };

  useEffect(() => {
    document.addEventListener("mousedown", closeOpenMenus);
  }, [optionsMenuRef, emojiPickerRef, closeOpenMenus]);

  const scrollToBottom = (isInitial?: boolean) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: isInitial === true ? "instant" : ("smooth" as any),
      });
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      messages.map((m) => {
        setRefMap((prev) => {
          const prevRefs = { ...prev };
          prevRefs[m.messageId] = createRef();
          return prevRefs;
        });
      });
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation]);

  const scrollToQuote = (id: string) => {
    try {
      setQuoteId(id);
      const selectedRef = refMap[id];
      if (selectedRef.current) {
        selectedRef.current.style.backgroundColor = "#282c34";
        selectedRef.current.style.transition = "0.5s";
        setTimeout(() => {
          selectedRef.current.style.backgroundColor = "transparent";
        }, 1500);
        selectedRef?.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const sectionedMessages = messages.reduce(
    (list: { date: string; messages: Message[] }[], item) => {
      const date = moment(item.createdAt).format("MMMM DD, YYYY");

      const dateExists = list.find((i) => i.date === date);

      if (dateExists) {
        dateExists.messages.push(item);
      } else {
        const newRec = {
          date,
          messages: [item],
        };
        list.push(newRec);
      }

      return list;
    },
    []
  );

  const handleScroll = () => {
    if (ref.current.scrollTop === 0) {
      const scrollHeightBeforeFetch = ref.current.scrollHeight;
      setPresentPage((prevPage) => prevPage + 1); // Increment page number
      const scrollHeightAfterFetch = ref.current.scrollHeight;
      ref.current.scrollTop = scrollHeightAfterFetch - scrollHeightBeforeFetch;
    }
  };

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    try {
      const scrollContainer = ref.current;
      const previousScrollHeight = scrollContainer.scrollHeight;
      const previousScrollTop = scrollContainer.scrollTop;
      const { scrollTop } = e.target as HTMLDivElement;
      const containerHeigh = calculateHeight();
      if (scrollTop <= 0) {
        getOlderMessages(() => {});
      }
    } catch (error) {
      console.error(error.message)
    }
  }
  

  // Get's position of last message before pagination
  useLayoutEffect(() => {
    try {
      if (!scrollToKey || (ref.current as HTMLDivElement).scrollTop !== 0) return;
      if (itemRefs.current[scrollToKey]) {
        itemRefs.current[scrollToKey].scrollIntoView();
      }
    } catch (error) {
      console.error(error.message)
    }
   
  }, [scrollToKey]);

  return (
    <div
      ref={ref}
      onScroll={onScroll}
      className={styles.wrapper}
      style={{ height: `calc(100vh - 80px - 60px - ${headerHeightOffset}px)` }}
    >
      {fetchingMore && (
        <div className={styles.loading}>
          <Text styles={{ color: "white" }} size="sm" text="Loading more..." />
        </div>
      )}
      {sectionedMessages.map((_item, i) => {
        return (
          <div key={i} className={styles.wrapper__sec}>
            <div
              style={{
                justifyContent: "center",
                display: "flex",
                width: "100%",
                alignItems: "center",
              }}
              key={`${i}-sec`}
            >
              <div
                style={{
                  flex: 1,
                  height: ".5px",
                  width: "100%",
                  backgroundColor: theme?.divider,
                }}
              />
              <div
                style={{
                  backgroundColor:
                    config?.theme?.background?.secondary || "#1b1d21",
                }}
                className={styles.wrapper__date}
              >
                <Text
                  styles={{ color: textColor }}
                  size="xs"
                  text={formatSectionTime(_item.date)}
                />
              </div>
              <div
                style={{
                  flex: 1,
                  height: ".5px",
                  width: "100%",
                  backgroundColor: theme?.divider,
                }}
              />
            </div>

            {_item.messages.map((item, index) => (
              <div
                ref={(el: HTMLDivElement) =>
                  (itemRefs.current[item.messageId] = el)
                }
              >
                <div ref={refMap[item?.messageId]}>
                  {props.renderChatBubble ? (
                    props.renderChatBubble(item)
                  ) : (
                    <Conversation
                      hideAvartar={
                        item.messageOwner.uid ===
                        _item.messages[index + 1]?.messageOwner.uid
                      }
                      textInputRef={textInputRef}
                      show={showOptions && activeIndex == item.messageId}
                      showEmojiPanel={
                        showEmojiPanel && activeIndex == item.messageId
                      }
                      index={index}
                      key={index}
                      message={item}
                      onPress={(e) => handlePress(e, item.messageId)}
                      setEditDetails={setEditDetails}
                      canEdit={item.from === client?.userMeta.uid}
                      openEmojiPanel={() => openEmojiPanel(item.messageId)}
                      optionsMenuRef={optionsMenuRef}
                      emojiPickerRef={emojiPickerRef}
                      mousePosition={mousePosition}
                      client={client}
                      conversationId={conversationId}
                      closeOptionsMenu={() => setShowOPtions(false)}
                      scrollToQuote={scrollToQuote}
                      recipientId={recipientId}
                      setShowEmojiPanel={setShowEmojiPanel}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      })}
      {recipientTyping && (
        <TypingIndicator message={sectionedMessages[0]?.messages[0]} />
      )}
      <div ref={messagesEndRef} style={{ height: "1px", width: "100%" }} />
    </div>
  );
}

export default MessageList;
