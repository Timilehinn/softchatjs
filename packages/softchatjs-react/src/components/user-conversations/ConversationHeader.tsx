import { ConnectionStatus } from '@/src/providers/clientStateProvider'
import { ReactTheme } from '@/src/theme/type'
import React from 'react'

export default function ConversationHeader({ connectionStatus, theme }: { connectionStatus: ConnectionStatus, theme: ReactTheme }) {

  return (
    <div style={{
      width: "100%",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px'
    }}>
      {connectionStatus.connecting ? (
      <p style={{ color: theme.text.primary }}>Connecting...</p>
      ):(
        <div>
          {connectionStatus.isConnected ? (
            <span style={{ display: 'flex', alignItems: 'center', color: theme.text.primary }}>Connected <div style={{ marginLeft: 10, height: '5px', width: '5px', borderRadius: '5px', backgroundColor: 'green' }} /></span>
          ):(
            <span style={{ display: 'flex', alignItems: 'center', color: theme.text.primary }}>Not connected <div style={{ marginLeft: 10,  height: '5px', width: '5px', borderRadius: '5px', backgroundColor: 'red' }} /></span>
          )}
        </div>
      )}
    </div>
  )
}
