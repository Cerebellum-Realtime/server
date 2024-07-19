import { Socket } from "socket.io";
import { DB } from "../utils/db";
const db = new DB();

export const registerSubscriptionHandlers = (socket: Socket) => {
  const subscribe = async (
    channelName: string,
    callback: Function,
    limit?: number,
    sortDirection?: "ascending" | "descending"
  ) => {
    try {
      const result = await Promise.all([
        socket.join(channelName),
        db.channelExists(channelName),
      ]);

      const { contents, lastEvaluatedKey } =
        await db.getMessagesForChannelPaginated(
          channelName,
          limit,
          sortDirection
        );

      callback({
        success: true,
        pastMessages: contents,
        lastEvaluatedKey,
      });
    } catch (error) {
      console.error(`Failed to subscribe to ${channelName}:`, error);
      callback({
        success: false,
      });
    }
  };

  const unsubscribe = async (channelName: string, callback: Function) => {
    try {
      await socket.leave(channelName);
      callback({
        success: true,
      });
    } catch (error) {
      console.error(`Failed to unsubscribe from ${channelName}:`, error);
      callback({
        success: false,
      });
    }
  };

  socket.on("channel:subscribe", subscribe);
  socket.on("channel:unsubscribe", unsubscribe);
};
