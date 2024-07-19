import { Server, Socket } from "socket.io";
// import { DB } from "../utils/db";
import { sendMessageToQueue } from "../utils/queue";

// import

// const db = new DB();

export const registerQueueHandlers = (io: Server, socket: Socket) => {
  const sendMessage = async (
    channelId: string,
    channelName: string,
    message: string
  ) => {
    try {
      const sendDescription = "sent thru queue";

      // TODO: send thru queue instead...
      // await db.saveMessage(channelId, message);

      sendMessageToQueue(channelId, message, sendDescription);
      // Still publish to user to maintain highest availability
      io.to(channelName).emit(`message:receive:${channelName}`, {
        channelName,
        message,
        sendDescription,
      });
      console.log(`Sending message to channel ${channelName}:`, message);
    } catch (error) {
      console.error(`Failed to send message to ${channelName}:`, error);
    }
  };

  socket.on("message:queue", sendMessage);
};
