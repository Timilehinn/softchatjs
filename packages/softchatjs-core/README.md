
# SoftchatJS Core

Javascript client for JS based frameworks

## Initiating the client
To get started a new connection instance needs to be created by passing in the your projectId and subId. Create a free account at: https://www.softchatjs.com          

```javascript
import ChatClient, { Conversation, Message } from 'softchatjs-core';

const client = ChatClient.getInstance({ subId: '1234', projectId: '1234' });

```
## Create a user session

To get started a new connection instance needs to be created by passing in the your projectId and subId

```javascript

import ChatClient, { Conversation, Message } from 'softchatjs-core';

// To create a user session, pass in the user's id and username
// if the uid doesn't alread exist, a new user is created

const chatUser = { 
    uid: '14', 
    username: 'oscar',
    firstname: '',  // optional
    profileUrl: '', // optional
    lastname: '', // optional
    custom: {}, // optional
    color: '' // optional
}
client.initializeUser(chatUser);

```

## Notifications
Push notifications are supported through Expo, Firebase Cloud Messaging (FCM), and Apple Push Notification Service (APNS). While Expo push notifications are configured to work seamlessly without additional setup, integrating `FCM` or `APNS` requires uploading your credentials to the dashboard. Navigate to `Project → Settings` to add your `FCM` or `APNS` credentials.

How to initiate a session with a user's notification details:
```javascript
var notificationConfig = {
  type: "expo" // "expo" | "fcm" | "apns",
  token: "Expo[XXXXXX]" // device token
}
client.initializeUser(chatUser, { notificationConfig });
```

## The MessageClient Overview
The MessageClient provides a comprehensive interface for managing conversations, messages, and broadcast lists within your application. It offers a variety of methods to streamline interactions with these components, enabling developers to efficiently integrate messaging functionalities.

```javascript
import ChatClient, { Conversation, Message } from 'softchatjs-core';

// To create a user session, pass in the user's id and username
// if the id doesn't alread exist, a new user is created

const chatUser = { 
  uid: '14', 
  username: 'oscar',
  firstname: '',  // optional
  profileUrl: '', // optional
  lastname: '', // optional
  custom: {}, // optional
  color: '' // optional
}

client.initializeUser(chatUser);

``` 
### Get message history:
  ```javascript
  const messages = await client.messageClient(conversationId).getMessages() as Array<Message>
  setMessages(messages);
  ``` 
### Sending a message:
  ```javascript
  const conversationId = "my-conversation-id"; // replace with actual conversation id
  const recipientId = '19';
  const msClient = client.messageClient(conversationId);
  msClinet.sendMessage({
    conversationId,
    to: recipientId, // replace with actual userId
    message: "Hello 😊",
    quotedMessageId: "",
    reactions: [],
    attachedMedia: [],
    quotedMessage: null
  })
```

### Edit a message:
```javascript
  const conversationId = "my-conversation-id"; // replace with actual converationId
  const msClient = client.messageClient(conversationId);
  msClient.editMessage({
  to: "user-123", // replace with actual userId
  conversationId: "my-conversation-id",
  messageId: "message-id-to-delete",
  textMessage: "Hey there!",
  shouldEdit: true,
```

### Send typing notification:
```javascript
  const conversationId = "my-conversation-id"; // replace with actual converationId
  const msClient = client.messageClient(conversationId);
  msClient.sendTypingNotification(
    "user-123", // replace with actual userId
  );
```

### Sending stopped typing notification:
```javascript
  const conversationId = "my-conversation-id"; // replace with actual converationId
  const msClient = client.messageClient(conversationId);
  msClient.sendStoppedTypingNotification(
    "user-123," // replace with actual userId
  );
```

### React to a message

```javascript
  const conversationId = "my-conversation-id"; // replace with actual converationId
  const msClient = client.messageClient(conversationId);
  msClient.reactToMessage(
    {
      conversationId,
      messageId: "message-id",
      reactions: [{
        emoji: "🤷",
        uid: "me-123", // this needs to be fixed**
      }],
      to: "user-123" // replace with actual userId
    }
  );
```

### Upload an attachment

```javascript
  const conversationId = "my-conversation-id"; // replace with actual converationId
  const msClient = client.messageClient(conversationId);
  const res = await msClient.uploadFile(
    uri: string | NodeJS.ReadableStream | Buffer | File,
    meta: {
      filename: string;
      mimeType: string;
      ext: string
    }
  )

  // res = { data: { url: 'https://www.uploaded.file.com/123' } }
```

### Delete a message

```javascript
const msClient = client.messageClient(conversationId);
msClient.deleteMessage(messageId, conversationId);
```

### Get messages
Messages are paginated by default, with 25 per page
```javascript
const msClient = client.messageClient(conversationId);
const messages = await msClient.getMessages(1); // page
```

### Read messages

```javascript
const msClient = client.messageClient(conversationId);
msClient.readMessages(conversatioId, { uid: 'my-id', messageIds: ['message-id'] });
```

### Create new conversation
*There are two types of conversations `private-chat` & `group-chat` (Private conversations and Group conversations). Creating a conversation requires two steps; Adding participant(s) and sending the initial message*

#### Creating a private conversation `private-chat`

```javascript
 const conn = client.newConversation({ id: "100", username: 'john-123' });
 const newConversation = conn.create('Hey there');
 console.log(newConversation)
```

#### Creating a group conversation `group-chat`

```javascript

 var participants = [
    { uid: "101", username: 'john-123' },
    { uid: "102", username: 'mike-234' },
    { uid: "103", username: 'susan-345' }
 ]
 var groupMeta = {
    groupName: 'Cool group',
    groupIcon: 'https://www.link-to-icon.com/png/200',
    groupBanner: 'https://www.link-to-icon.com/png/200'
 }
 const conn = client.newConversation(participants, groupMeta);
 conn.create('Hey there');
```

## Events

Events are used to listen for detect and respond to changes in the user session

#### 1. conversation_list_meta_changed: 
  ```javascript
  client.subscribe("conversation_list_meta_changed", (event: ChatEventGenerics<{ conversationListMeta: ConversationListMeta }>) => {
    const conversationList = Object.values(event.conversationListMeta).flat() as { conversation: Conversation, lastMessage: Message, unread: string[] }[];
    console.log(conversationList)
  })

  ```

#### 2. connection_changed: Changes in the connection status:
  ```javascript
  client.subscribe("connection_changed", (event: ChatEventGenerics<ConnectionEvent>) => {
    console.log(event)
  });
  ``` 
#### 3. new_message: A new message recieved in a chat:
  ```javascript
client.subscribe("new_message", (event) => {
    console.log(event);
});
  ```

#### 4. edited_message: An existing message has been edited:
  ```javascript
client.subscribe("edited_message", (event) => {
    console.log(event);
});
  ```

#### 5. started_typing: Recipient started started typing:
```javascript
client.subscribe("started_typing", (event) => {
    console.log(event);
});
```

#### 6. stopped_typing: Recipient stopped typing:
```javascript
client.subscribe("stopped_typing", (event) => {
    console.log(event);
});
```

#### 7. deleted_message: Delete message from a conversation:
```javascript
client.subscribe("deleted_message", (event) => {
console.log(event);
});
```

#### 7. broadcast_list_meta_changed
```javascript
client.subscribe("broadcast_list_meta_changed", (event) => {
console.log(event);
});
```

### Unsubscribing from events

It's usually good practise to unsubscribe from from events when they're no longer in need. You can easily unsubscribe from an event by using the unsubscribe method from `client` Example:

```javascript
client.unsubscribe("stopped_typing", handleStoppedTypingFunc);

// or to unsubscribe from all events

client.unsubscribeAll("stopped_typing");
```

## Broadcast lists

Use broadacast lists to send a single message to multiple users, each conversation will be sent as a private message to each recipient

```javascript
import ChatClient, { Conversation, Message, ChatEventGenerics } from 'softchatjs-core';

const client = ChatClient.getInstance({ subId: '1234', projectId: '1234' });

Create a new broadcast list
const newBroadcastList = client.newBroadcastList([
  {
    username: "skyline_ace",
    uid: "a1b2c3d4e5",
    firstname: "Alex",
    lastname: "Smith",
    profileUrl: "https://avatar.iran.liara.run/public",
    custom: { bio: "Lover of heights", hobby: "Climbing" },
    color: "#3498db",
  },
]);
const newList = newBroadcastList.create();
console.log(newList);

```

#### Update a broadacast list
```javascript
client.updateBroadcastList({ broadcastListId: string, participants: string[], name: string });
```

#### Delete a broadacast list
```javascript
client.deleteBroadcastList({ broadcastListId: "12345" })
```

## Get connection status
You can check the connection status of a client, even if event handlers have not been configured yet.
```javascript
var connStatus = client.getConnectionStatus();
console.log(connStatus);
// {
//   connecting: false,
//   isConnected: true,
//   fetchingConversations: false,
// }
```

## Retrying a connection
If the connection is lost, the system will attempt to reconnect the user automatically. After 5 unsuccessful reconnection attempts, the connection will be terminated. To manually retry the connection, you can call the `retryConnection()` method at any time.
```javascript
client.retryConnection();
```

## Disconnecting a user
You may choose to disconnect a user, such as during a logout process or for other specific reasons. The `disconnect()` method terminates the socket connection and clears all associated user details.
```javascript
client.disconnect();
```