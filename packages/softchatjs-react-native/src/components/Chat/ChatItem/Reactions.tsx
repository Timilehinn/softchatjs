import React from "react";
import { View, TouchableOpacity, Image, Text, Platform, ViewStyle } from "react-native";
import { Reaction, ServerActions } from "../../../types";
import { useConfig } from "../../../contexts/ChatProvider";
import theme from "../../../theme";

type ReactionProps = {
  reactions: Reaction[];
  position: "left" | "right";
  conversationId: string, 
  messageId: string,
  chatUserId: string,
  recipientId: string,
  layout?: 'stacked'
};

export default function Reactions(props: ReactionProps) {
  const { reactions, position, conversationId, messageId, chatUserId, recipientId, layout } = props;
  const { client, theme } = useConfig()

  const removeReaction = (selected: Reaction) => {
    if(client){
      if(selected.uid === chatUserId) {
        const index = reactions.indexOf(selected);
        if(index !== -1) {
          const updateReactions = reactions.filter(r => reactions.indexOf(r) !== index);
          client.messageClient(conversationId).reactToMessage(
            {
              conversationId: conversationId,
              messageId: messageId,
              reactions: updateReactions,
              to: recipientId
            }
          )
        }
      }
    }
  }

  return (
    <View style={[{ flexDirection: "row" }, layout !== 'stacked' && { marginTop: -3 }]}>
      {reactions.map((reaction, i) => (
        <TouchableOpacity
          key={i}
          onPress={() => removeReaction(reaction)}
          style={{
            backgroundColor: position === "left" ? theme?.background.primary : theme?.background.secondary,
            borderRadius: 45,
            borderWidth: 2,
            borderColor: theme?.divider,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: 'row',
          }}
        >
          <Text
            style={{ fontSize: Platform.OS === 'android'? 16 : 18 }}
          >{reaction.emoji}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
