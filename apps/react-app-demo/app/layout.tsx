"use client";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ChatClientProvider } from "softchatjs-react";
import ChatClient from "softchatjs-core";
import { AppProvider } from "./context/AppProvider";


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

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
        <meta name="description" content="Description" />
      </head>
      <AppProvider client={client}>
        <ChatClientProvider
          client={client}
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
          <body className={`${geistSans.variable} ${geistMono.variable}`}>
            <>{children}</>
          </body>
        </ChatClientProvider>
      </AppProvider>
    </html>
  );
}
