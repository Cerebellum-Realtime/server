import { Socket } from "socket.io";
import { DB } from "../utils/db";
import { Message as MessageType } from "../types/Message";

const db = new DB();

export const registerSubscriptionHandlers = (socket: Socket) => {
  const subscribe = async (channelName: string, callback: Function) => {
    try {
      await Promise.all([
        socket.join(channelName),
        db.channelExists(channelName),
      ]);

      callback({
        success: true,
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

  const getPastMessages = async (
    channelName: string,
    limit: number,
    sortDirection: "ascending" | "descending" = "ascending",
    lastEvaluatedKey: MessageType | undefined = undefined,
    callback: Function
  ) => {
    console.log(callback);
    try {
      const { contents, returnedLastEvaluatedKey } =
        await db.getMessagesForChannelPaginated(
          channelName,
          limit,
          sortDirection,
          lastEvaluatedKey
        );

      callback({
        success: true,
        pastMessages: contents,
        lastEvaluatedKey: returnedLastEvaluatedKey,
      });
    } catch (error) {
      console.error("Error getting past messages: ", error);
      callback({
        success: false,
      });
    }
  };

  socket.on("channel:subscribe", subscribe);
  socket.on("channel:unsubscribe", unsubscribe);
  socket.on("channel:history", getPastMessages);
};
