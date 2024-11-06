import { ReactTheme } from "./type";

export const defaulTheme: ReactTheme = {
  background: {
    primary: "#FFFFFF", // White for the primary background
    secondary: "#F5F5F5", // Light grey for secondary background
    disabled: "#E0E0E0", // Very light grey for disabled background
  },
  text: {
    primary: "#000000", // Black text for high contrast
    secondary: "#4A4A4A", // Dark grey for secondary text
    disabled: "#9E9E9E", // Light grey for disabled text
  },
  action: {
    primary: "#007AFF", // Bright blue for primary action buttons
    secondary: "#5AA3FF", // Light blue for secondary action buttons
  },
  chatBubble: {
    left: {
      bgColor: "#E5E5EA", // Light grey for incoming message background
      messageColor: "#333333", // Dark grey for incoming message text
      messageTimeColor: "#6D6D6D", // Medium grey for message time
      replyBorderColor: "#D1D1D6", // Slightly darker grey for reply border
    },
    right: {
      bgColor: "#D0EBFF", // Light blue for outgoing message background
      messageColor: "#000000", // Black for outgoing message text
      messageTimeColor: "#6D6D6D", // Medium grey for message time
      replyBorderColor: "#A3D1FF", // Medium blue for reply border
    },
  },
  icon: "#4A4A4A", // Dark grey for icons
  divider: "#E0E0E0", // Light grey for dividers
  hideDivider: false,
  input: {
    bgColor: "#F0F0F5", // Light grey for input background
    textColor: "#000000", // Black for input text
    emojiPickerTheme: "light", // Light theme for emoji picker
  }
};
