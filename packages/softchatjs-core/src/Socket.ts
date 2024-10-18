// import Connection from "./Connection";
// import { Events } from "./events";

// export default class Socket {

//   private connection: Connection

//   constructor(connection: Connection) {
//     this.connection = connection
//   }

//   initialize(message: string, wsUrl: string) {
//     var socket = this.connection.socket
//     if (this.connection.socket && this.connection.socket?.readyState === WebSocket.OPEN) {
//       console.log('already socket opened')
//       socket.send(message); // send a message
//       this.connection.emit(Events.CONNECTION_CHANGED, {
//         connecting: false,
//         isConnected: true,
//         fetchingConversations: false,
//       });
//     } else {
//       var ws = new WebSocket(
//         `wss://${wsUrl}`
//       );
//       ws.onopen = () => {
//         console.log('socket opened')
//         socket = ws;
//         ws.send(message); // send a message
//         this.connection.emit(Events.CONNECTION_CHANGED, {
//           connecting: false,
//           isConnected: true,
//           fetchingConversations: false,
//         });
//         // this.emit(Events.CONVERSATION_LIST_CHANGED, {
//         //   conversations: this.conversations,
//         // });
//       };
//     }
//   }
// }