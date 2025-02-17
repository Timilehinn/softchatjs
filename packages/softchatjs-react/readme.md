
# Integrating the React SDK

Install the softchat-js SDKs

```
yarn add softchatjs-react softchatjs-core
Or
npm install softchatjs-react softchatjs-core

```

Initialize the client. Create a free account at: https://www.softchatjs.com

```
import ChatClient from "softchatjs-core";

const client = ChatClient.getInstance({
  projectId: "your-project-id",
  subId: "your-sub-id",
});
```

Wrap your application with ChatClientProvider and pass the client instance.

```
import { ChatClientProvider } from "softchatjs-react"


export default function App(){
  return (
    <ChatClientProvider
      client={client}
    >
      <div>
        <p>My app</p>
      </div> 
    </ChatClientProvider>
  );
}
```

To use the chat interface component in your application, import it into any page where you want the chat feature to appear. The Chat component renders the main chat UI and accepts props that provide data about the active user and potential conversation participants.

#### Props

user -> An object that represents the currently active user's details, typically including properties like uid, username, profileUrl e.t.c.

userList -> An array of user objects, each representing a user that can be added to a conversation. Each user object might include uid, username and profileUrl to help identify participants in the UI.




```
import { Chat } from "softchatjs-react"
import { users } from '../constants/users 

export default function ChatPage() {
  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Chat
        user={{
          uid: "30",
          username: "makaveli96",
          profileUrl:
            "profile-pic.png",
        }}
        userList={users}
      />  
    </div>
  );
}

```


## Theming

The Softchat-js SDK offers a flexible way to customize the chat interface by allowing you to pass configuration properties (props) to personalize the UI.

Customizing the chat themes can be done by passing custom theme to the ChatClientProvider.

```

const sampleTheme = {
  background: {
    primary: "#FFFFFF", // White background for light mode
    secondary: "#F0F0F0", // Light grey for secondary background
    disabled: "#E0E0E0", // Lighter grey for disabled background
  },
  text: {
    primary: "#000000", // Black text for high contrast
    secondary: "#555555", // Dark grey for secondary text
    disabled: "#B0B0B0", // Light grey for disabled text
  },
  action: {
    primary: "#4F9ED0", // Dark teal for primary action buttons (accent color)
    secondary: "#B3D8F0", // Light teal for secondary action buttons
  },
  chatBubble: {
    left: {
      bgColor: "#F0F0F0", // Light grey for incoming message background
      messageColor: "#333333", // Dark grey for incoming message text
      messageTimeColor: "#777777", // Medium grey for message time
      replyBorderColor: "#D0D0D0", // Light border color for replies
    },
    right: {
      bgColor: "#B3D8F0", // Light teal for outgoing message background
      messageColor: "#000000", // Black for outgoing message text
      messageTimeColor: "#777777", // Medium grey for message time
      replyBorderColor: "#4F9ED0", // Accent color for reply border
    },
  },
  icon: "#555555", // Dark grey for icons
  divider: "#E0E0E0", // Light grey for dividers
  hideDivider: false,
  input: {
    bgColor: "#FFFFFF", // White background for input
    textColor: "#000000", // Black text for input
    emojiPickerTheme: "light", // Light theme for emoji picker
  },
};


export default function App(){
  return (
    <ChatClientProvider
      client={client}
      theme={theme}
    >
      <div>
        <p>My app</p>
      </div> 
    </ChatClientProvider>
  );
}
```

## Custom components

Also, custom components can be used by passing them to the Chat component imported above. Full list of props below :

Prop | Usage|  
--- | --- | 
user | The user object represents the active user's details. E.g UID, username, profileUrl |
renderChatBubble | Allows rendering custom chat bubble component. |
renderChatInput | Allows rendering custom chat input. |
renderConversationList | Allows rendering custom conversation list. |
renderNavbar | Allows rendering custom side navigation bar. |

## Sample

renderChatBubble -> This can be used to customize how individual chat messages look by passing a custom component.

```
import { Chat } from "softchatjs-react"

export default function ChatPage() {
  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Chat
        user={{
          uid: "30",
          username: "makaveli96",
          profileUrl:
            "profile-pic.png",
        }}
       
        renderChatBubble={(message) => (
          <div style={{ padding: "40px",  }}>
            {message.message}
          </div>
        )}
      /> 
    </div>
  );
}
```

The renderChatBubble takes the message argument that can be used in the custom chat bubble component. With access to the message object, message details like time, text, attachments e.t.c can be displayed based on your UI.