import { ReactTheme } from "./type";

export const defaulTheme: ReactTheme = {
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
