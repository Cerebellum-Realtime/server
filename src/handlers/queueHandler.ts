import { Server, Socket } from "socket.io";
import { handleSendMessageToQueue } from "../utils/queue";

export const registerQueueHandlers = (io: Server, socket: Socket) => {
  const sendMessage = async (channelName: string, message: string) => {
    try {
      const createdAt = new Date().toISOString();

      handleSendMessageToQueue(channelName, message, createdAt);

      io.to(channelName).emit(`message:receive:${channelName}`, {
        createdAt,
        content: message,
      });
      console.log(`Sending message to channel ${channelName}:`, message);
    } catch (error) {
      console.error(`Failed to send message to ${channelName}:`, error);
    }
  };

  socket.on("message:queue", sendMessage);
};
