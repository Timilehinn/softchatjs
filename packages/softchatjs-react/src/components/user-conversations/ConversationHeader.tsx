import { ConnectionStatus } from "@/src/providers/clientStateProvider";
import { ReactTheme } from "@/src/theme/type";
import React, { useState } from "react";

export default function ConversationHeader({
  connectionStatus,
  theme,
  onTextChange
}: {
  connectionStatus: ConnectionStatus;
  theme: ReactTheme;
  onTextChange: (value: string) => void;
}) {

  const [ value, setValue ] = useState('');

  const handleTextChange = (value: string) => {
    setValue(value); onTextChange(value)
  }

  return (
    <div
      style={{
        width: "100%",
        padding: "20px",
      }}
    >
      <div>
        {connectionStatus.isConnected ? (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              color: theme.text.primary,
            }}
          >
            {/* Connected{" "}
            <div
              style={{
                marginLeft: 10,
                height: "5px",
                width: "5px",
                borderRadius: "5px",
                backgroundColor: "green",
              }}
            /> */}
            <p style={{ fontWeight: "bold", fontSize: "26px" }}>Chats</p>
            <span
              style={{
                marginLeft: 10,
                height: "5px",
                width: "5px",
                borderRadius: "5px",
                backgroundColor: "green",
              }}
            /> 
          </span>
        ) : (
          <p style={{ color: theme.text.primary }}>Connecting...</p>
        )}
      </div>
      <input 
        value={value}
        onChange={e => handleTextChange(e.target.value)}
        placeholder="Search chats"
        style={{ 
          height: '40px', 
          width: '100%', 
          marginTop: '15px', 
          textIndent: '15px', 
          backgroundColor: 'transparent', 
          // color: 'white', 
          border: `1px solid ${theme.divider}`, 
          borderRadius: '10px',
          color: theme.text.primary
        }}
      />
    </div>
  );
}
