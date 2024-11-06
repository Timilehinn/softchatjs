export type ReactTheme = {
  background: {
    primary: string; // White background for light mode
    secondary: string; // Light grey for secondary background
    disabled: string;
  };
  text: {
    primary: string; // Black text for high contrast
    secondary: string; // Dark grey for secondary text
    disabled: string; // Light grey for disabled text
  };
  action: {
    primary: string; // Dark teal for primary action buttons
    secondary: string; // Light teal for secondary action buttons
  };
  chatBubble: {
    left: {
      bgColor: string; // Light grey for incoming message background
      messageColor: string; // Dark grey for incoming message text
      messageTimeColor: string; // Medium grey for message time
      replyBorderColor: string;
    };
    right: {
      bgColor: string; // Light teal for outgoing message background
      messageColor: string; // Black for outgoing message text
      messageTimeColor: string; // Medium grey for message time
      replyBorderColor: string;
    };
  };
  icon: string; // Dark grey for icons
  divider: string; // Light grey for dividers
  hideDivider:boolean
  input:{
    bgColor:string,
    textColor:string
    emojiPickerTheme:"dark" | "light"
  }
}
