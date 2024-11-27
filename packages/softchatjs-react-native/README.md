
# softchatjs-react-native

React native UI SDK for softchatjs-core. Create a free account at: https://www.softchatjs.com

## Installation
`npm install softchatjs-core softchatjs-react-native`

## Install the peer dependecies
`npm install expo-av expo-camera expo-file-system expo-image expo-image-picker @shopify/flash-list expo-video`

## Usage

```javascript
import React, { useEffect } from 'react';
import { ChatProvider, Conversations } from "softchatjs-react-native";
import ChatClient from "softchatjs-core"

const client = ChatClient.getInstance({ subId: 'xxxx', projectId: 'xxxx' });

var chatUser = {
    uid: '1234',
    username: 'abc-123',
    firstname: "John",
    lastname: "Doe",
    profileUrl: "",
    custom: { "anything": "anything" },
}

function App() {

    const [ currentConversation, setCurrentConversation ] = useState(null)

    useEffect(() => {
        if (client) {
            client.initializeUser(chatUser);
        }
    }, [client]);

  return (
    <ChatProvider
        client={client}
    >
        {currentConversation? (
            <Chat
                activeConversation={currentConversation}
            />
        ):(
            <Conversations
                user={chatUser}
                onOpen={({ activeConversation }) => {
                    setCurrentConversation(activeConversation)
                }}
            />
        )}
        
    </ChatProvider>
  );
}

export default App;

```
### Guide

## `<Conversations />` Component API
### Props

| Parameter | Type     | Default | Description      |
| :-------- | :------- | :-------| :----------------|
| `user` | `UserMeta` | | **Required**. chat user |
| `onOpen` | `Function` | | **Required**. Function that returns the selected conversation |
| `renderItem` | `Function` | |Render a custom conversation item |
| `renderHeader` | `Function` | | Render a custom conversation header |
| `renderPlaceHolder` | `Function` | | Render a custom placeholder |
| `users` | `UserMeta[]` | | list of users a conversation can be initiated with |
| `store` | `ConversationListMeta` | | Locally stored conversation map |


## `<Chat />` Component API
### Props

| Parameter | Type     | Default | Description      |
| :-------- | :------- | :-------| :----------------|
| `activeConversation` | `ConversationListItem` | | **Required**. Selected conversation |
| `renderChatBubble` | `Function` | | Render a custom chat item |
| `renderHeader` | `Function` | | Render chat header |
| `placeholder` | `JSX.Element` | | Render placeholder |
| `renderHeader` | `Function` | | Render custom chat input |
| `keyboardOffset` | `number` | | Value passed to adjust how the keyboard adjusts the input field when it's open |


## `<BroadcastLists />` Component API
### Props

| Parameter | Type     | Default | Description      |
| :-------- | :------- | :-------| :----------------|
| `client` | `ChatClient` | | **Required**. Selected conversation |
| `onOpen` | `Function` | | **Required** Function that returns the selected broadcast list |
| `renderItem` | `Function` | | Render a custom broadacast list item |

## Customizing the UI
```javascript

var fontFamily = "Giest"

var darkModeTheme: ReactTheme = {
  background: {
    primary: "#1b1d21", // White for the primary background
    secondary: "#202326", // Light grey for secondary background
    disabled: "#E0E0E0", // Very light grey for disabled background
  },
  text: {
    primary: "white", // Black text for high contrast
    secondary: "#4A4A4A", // Dark grey for secondary text
    disabled: "#9E9E9E", // Light grey for disabled text
  },
  action: {
    primary: "#007AFF", // Bright blue for primary action buttons
    secondary: "#5AA3FF", // Light blue for secondary action buttons
  },
  chatBubble: {
    left: {
      bgColor: "#343434", // Light grey for incoming message background
      messageColor: "white", // Dark grey for incoming message text
      messageTimeColor: "#6D6D6D", // Medium grey for message time
      replyBorderColor: "#D1D1D6", // Slightly darker grey for reply border
    },
    right: {
      bgColor: "#343434", // Light blue for outgoing message background
      messageColor: "white", // Black for outgoing message text
      messageTimeColor: "#6D6D6D", // Medium grey for message time
      replyBorderColor: "#A3D1FF", // Medium blue for reply border
    },
  },
  icon: "white", // Dark grey for icons
  divider: "rgba(128, 128, 128, 0.136)", // Light grey for dividers
  hideDivider: false,
  input: {
    bgColor: "#1b1d21", // Light grey for input background
    textColor: "white", // Black for input text
    emojiPickerTheme: "dark", // Light theme for emoji picker
  },
};

<ChatProvider
    client={client}
    theme={darkModeTheme}
    fontFamily={fontFamily}
>
    {children}
</ChatProvider>
```

