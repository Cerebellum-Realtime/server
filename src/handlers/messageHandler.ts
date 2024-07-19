import { Server, Socket } from "socket.io";
import { DB } from "../utils/db";

const db = new DB();

export const registerMessageHandlers = (io: Server, socket: Socket) => {
  const sendMessage = async (
    channelId: string,
    channelName: string,
    message: string
  ) => {
    try {
      console.log("channel", channelName, "message", message);
      // io.emit("message:confirmed");
      await db.saveMessage(channelId, message);
      io.to(channelName).emit(`message:receive:${channelName}`, {
        channelName,
        message,
        sendDescription: "sent directly to DB",
      });
      console.log(`Sending message to channel ${channelName}:`, message);
    } catch (error) {
      console.error(`Failed to send message to ${channelName}:`, error);
    }
  };

  socket.on("message:send", sendMessage);
};
