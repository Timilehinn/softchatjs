"use client";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ChatClientProvider } from "softchatjs-react/src";
import ChatClient from "softchatjs-core";
import { AppProvider } from "./context/AppProvider";

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
// });

const beautySpace = {
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

const client = ChatClient.getInstance({
  projectId: "5909b61d-e6be-47b5-bb54-a60e56344580",
  subId: "ef066542-6e13-4f25-a6c3-d3e3671e4662",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Title</title>
    {/* <script src="https://unpkg.com/react-scan/dist/auto.global.js" async></script> */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap"
          rel="stylesheet"
        />

        <meta name="description" content="Description" />
      </head>
      <AppProvider client={client}>
        <ChatClientProvider
          client={client}
          // theme={beautySpace}
          // theme: {
          //   background: {
          //     primary: "white",
          //     secondary: "white",
          //   },
          //   // text:"black",
          //   icon: "black",
          //   chatBubble: {
          //     left: {
          //       bgColor: "#F7F7F7",
          //       messageColor: "black",
          //       messageTimeColor: "black",
          //     },
          //     right: {
          //       bgColor: "#14D39D",
          //       messageColor: "black",
          //       messageTimeColor: "black",
          //     },
          //   },
          //   divider: "grey",
          //   text: {
          //     primary: "black",
          //   },
          //   hideDivider: true,
          //   input: {
          //     bgColor: "#F2F2F2",
          //     textColor: "black",
          //     emojiPickerTheme: "light",
          //   },
          // },
        >
          <body>
            <>{children}</>
          </body>
        </ChatClientProvider>
      </AppProvider>
    </html>
  );
}
