import React, { useEffect, useState } from "react";
import styles from "./broadcast-lists.module.css";
import Avartar from "../avartar/avartar";
import { ArrowRight, BroadcastIcon } from "../assets/icons";
import { useChatClient } from "../../providers/chatClientProvider";
import { ConversationListItem, ConversationListMeta } from "softchatjs-core";
import Text from "../text/text";
import { useChatState } from "../../providers/clientStateProvider";

export default function BroadcastLists(props: {}) {
  const { client, config } = useChatClient();
  const { setActiveConversation } = useChatState();

  const [broadcastLists, setBroadcastLists] = useState<
    Array<ConversationListItem>
  >([]);

  const handleBroadcastListMetaChanged = (event: any) => {
    const list = Object.values(event.broadcastListMeta).flat();
    setBroadcastLists(list);
  };

  useEffect(() => {
    if (client) {
      const res = client.getBroadcastLists();
      const list = Object.values(res).flat();
      setBroadcastLists(list);
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
