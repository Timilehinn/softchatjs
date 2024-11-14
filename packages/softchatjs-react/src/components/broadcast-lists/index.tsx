import React, { useEffect, useState } from "react";
import styles from "./broadcast-lists.module.css";
import Avartar from "../avartar/avartar";
import { ArrowRight, BroadcastIcon } from "../assets/icons";
import { useChatClient } from "../../providers/chatClientProvider";
import { ConversationListItem, ConversationListMeta } from "softchatjs-core";
import Text from "../text/text";
import { useChatState } from "../../providers/clientStateProvider";
import { PiPlusCircle } from "react-icons/pi";

export default function BroadcastLists(props: { onCreateBroadcastList: () => void; }) {
  const { onCreateBroadcastList } = props;
  const { client, config } = useChatClient();
  const { setActiveConversation } = useChatState();

  const [broadcastLists, setBroadcastLists] = useState<
    Array<ConversationListItem>
  >([]);

  const handleBroadcastListMetaChanged = (event: any) => {
    const list = Object.values(event.broadcastListMeta).flat() as ConversationListItem[]
    setBroadcastLists(list);
  };

  const getBroadcastLists = () => {
    try {
      const res = client.getBroadcastLists();
      const list = Object.values(res).flat();
      setBroadcastLists(list);
    } catch (error) {
      
    }
  }

  useEffect(() => {
    if (client) {
      getBroadcastLists();
      client.subscribe(
        "broadcast_list_meta_changed",
        handleBroadcastListMetaChanged
      );
    }

    return () => {
      client.unsubscribe(
        "broadcast_list_meta_changed",
        handleBroadcastListMetaChanged
      );
    };
  }, [client]);

  return (
    <main
      className={styles.broadcast_container}
      style={{
        borderRight: `1px solid ${config.theme.divider}`,
        backgroundColor: config.theme.background.secondary,
        padding: '20px'
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          alignItems: "center",
        }}
      >
        <p style={{ fontWeight: "bold", fontSize: "26px" }}>Broadcast lists</p>
        <button onClick={() => onCreateBroadcastList?.()} style={{ border: 0, backgroundColor: 'transparent' }}>
          <PiPlusCircle size={22} color={config.theme.icon} />
        </button>
      </div>

      <div style={{ }}>
        {broadcastLists.length === 0 && (
          <div style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text
                styles={{
                  textAlign: "left",
                  marginRight: "15px",
                  color: config.theme.text.disabled,
                }}
                size="sm"
                text={`No broadcast lists available yet`}
              />
          </div>
        )}
        {broadcastLists.length > 0 &&
          broadcastLists.map((conversation, i) => (
            <div key={i} className={styles.broadcast_item}
              onClick={() => setActiveConversation(conversation)}
            >
              <div>
                <Text
                  styles={{
                    textAlign: "left",
                    marginRight: "15px",
                    color: config.theme.text.primary,
                  }}
                  size="md"
                  text={conversation.conversation.name}
                />
                <Text
                  styles={{
                    textAlign: "left",
                    marginRight: "15px",
                    color: config.theme.text.disabled,
                  }}
                  size="sm"
                  text={`${conversation.conversation.participants.length} recipients`}
                />
              </div>
              <ArrowRight size={10} color={config.theme.icon} />
            </div>
          ))}
      </div>
    </main>
  );
}
