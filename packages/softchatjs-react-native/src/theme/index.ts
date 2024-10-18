import { ChatTheme } from "../types"
import { bluishCyan, fuchsia, green, grey, stone, teal } from "./colors"

const theme: ChatTheme = {
  background: {
    primary: stone[900],
    secondary: grey[900],
    disabled: grey[800]
  },
  text: {
    primary: 'black',
    secondary: stone[200],
    disabled: stone[500],
  },
  action: {
    primary: teal[50],
    secondary: stone[300]
  },
  chatBubble: {
    left: {
      bgColor: grey[900],
      messageColor: stone[200],
      messageTimeColor: 'grey',
      replyBorderColor: stone[200]
    },
    right: {
      bgColor: "#CDD8DD",
      messageColor: 'black',
      messageTimeColor: 'grey',
      replyBorderColor: green[900]
    },
  },
  icon: 'white',
  divider: stone[700]
}

export default theme