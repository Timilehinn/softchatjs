# SoftchatJS

SoftchatJS is a flexible, full-featured text/voice messaging platform designed for businesses and developers. It enables real-time chat experiences across web and mobile platforms, with customizable UIs and a backend-agnostic architecture.

This monorepo contains all the packages and demo apps that make up the SoftchatJS ecosystem.

---

## 🗂 Monorepo Structure

```bash
softchatjs/
├── apps/
│   ├── expo-app-demo           # React Native + Expo demo for mobile
│   └── react-app-demo          # Web app demo using softchatjs-react
└── packages/
    ├── softchatjs-core         # Core JS SDK: event system, client logic
    ├── softchatjs-react        # React bindings and components
    └── softchatjs-react-native # React Native bindings and components
```

---

## 🚀 Getting Started

### 1. Install Dependencies

From the root of the monorepo:

```bash
npm install
```

> You can also use yarn or npm, but pnpm is recommended for workspace support.

### 2. Start Demo Apps

To run the web demo:

```bash
cd apps/react-app-demo && npm run dev
```

To run the Expo mobile demo:

```bash
cd apps/expo-app-demo && npm run dev
```

> Make sure you have Expo CLI installed globally:
> 
> ```bash
> npm install -g expo-cli
> ```

---

## ✨ Features

- 💬 Real-time messaging
- ✍️ Typing indicators (with debounced start/stop events)
- 👁️ Read receipts
- 😍 Emoji reactions
- 🔉 Voice messaging
- 🧵 Conversation threading (coming soon)
- 📂 File and media attachments
- 🛎️ Push notifications via FCM (Android) & APNs (iOS)
- 🧠 AI-assisted message summarization (planned)
- 🧪 Fully customizable UI via components and hooks
- 💡 Platform-agnostic logic for React and React Native
- 🧩 Broadcast lists

---

## 🧩 How the Chat Works

SoftchatJS is designed to be backend-agnostic and event-driven. Here's how the pieces fit together:

- 🔧 `softchatjs-core`  
  Contains the core logic: ChatClient, MessageClient, event system, and utilities for sending/receiving messages, typing indicators, and presence.

- 🌐 `softchatjs-react`  
  A package of React UI components (like `MessageList`, `Voice messages`, `ChatBubble`, `InputBox`) and hooks (like `useChatClient`) to help build chat interfaces on the web.

- 📱 `softchatjs-react-native`  
  The React Native counterpart to `softchatjs-react`. It provides mobile-ready components and hooks tailored for native environments via Expo.

> A a prebuild mobile/web app coming soon.

---

## 🏗 Architecture Overview

- 🔄 Event-driven architecture (pub/sub)
- 🔌 Pluggable transport layer (WebSocket, polling, etc.)
- 💡 Platform-agnostic core (logic shared across web and mobile)
- 📦 Modular design for scalability and flexibility
- ☁️ Backend-agnostic and designed for easy integration with custom infrastructures
- 📲 Push notifications supported via FCM (Firebase Cloud Messaging) and APNs (Apple Push Notification Service)


---

## 📦 Package Overview

| Package                      | Description                                                  |
|-----------------------------|--------------------------------------------------------------|
| `softchatjs-core`           | Core chat logic, clients, and event system                   |
| `softchatjs-react`          | React-specific components and hooks                          |
| `softchatjs-react-native`   | React Native (Expo-compatible) components and mobile hooks   |

---

## 🧪 Development Tips

- Use pnpm workspaces for local development.
- You can directly modify packages and see updates reflected in the demo apps.
- Prefer using the workspace protocol (e.g. "workspace:*") when linking internal packages.

---

## 📚 Future Plans

- 🌐 Chat widget
- 🧠 AI features (summarization, sentiment)
- 💬 Mentions, polls, video/audio calls
- 🔌 Backend SDKs for Node and Python

---

## 🤝 Contributing

We’d love to have your help! Whether it's improving docs, fixing bugs, or building new features—contributions are welcome.

1. Fork the repo
2. Create your feature branch
3. Submit a pull request

---

## 📬 Questions?

Feel free to open an issue or start a discussion. We're happy to help!

---

Made with ❤️ by the SoftchatJS team.
