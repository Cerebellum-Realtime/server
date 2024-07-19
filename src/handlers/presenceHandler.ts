import { Server, Socket } from "socket.io";
import { ChannelPresenceManager } from "../utils/presence";

const presenceManager = new ChannelPresenceManager();

interface UserInfo {
  [key: string]: string;
}

interface PresenceCallback {
  (response: { success: boolean; users?: UserInfo[]; error?: Error }): void;
}

export const registerPresenceHandlers = (io: Server, socket: Socket) => {
  const enterPresenceSet = async (channelName: string, userInfo: UserInfo) => {
    try {
      console.log(
        `[${socket.id}] Entering presence set for channel: ${channelName}`
      );
      const userPresence = await presenceManager.addUserToChannel(
        channelName,
        socket.id,
        userInfo
      );

      io.to(`presence:${channelName}`).emit(
        `presence:${channelName}:join`,
        userPresence
      );
      console.log(
        `[${socket.id}] Successfully entered presence set for channel: ${channelName}`
      );
    } catch (error) {
      console.error(`[${socket.id}] Error entering presence set:`, error);
    }
  };

  const leavePresenceSet = async (channelName: string) => {
    try {
      console.log(
        `[${socket.id}] Leaving presence set for channel: ${channelName}`
      );
      await presenceManager.removeUserFromChannel(channelName, socket.id);
      io.to(`presence:${channelName}`).emit(
        `presence:${channelName}:leave`,
        socket.id
      );
      console.log(
        `[${socket.id}] Successfully left presence set for channel: ${channelName}`
      );
    } catch (error) {
      console.error(`[${socket.id}] Error leaving presence set:`, error);
    }
  };

  const subscribePresenceSet = async (
    channelName: string,
    callback: PresenceCallback
  ) => {
    try {
      console.log(
        `[${socket.id}] Subscribing to presence set for channel: ${channelName}`
      );
      await socket.join(`presence:${channelName}`);
      const users = await presenceManager.getAllUsersInChannel(channelName);
      callback({ success: true, users });
      console.log(
        `[${socket.id}] Successfully subscribed to presence set for channel: ${channelName}`
      );
    } catch (error) {
      console.error(`[${socket.id}] Error subscribing to presence set:`, error);
      if (error instanceof Error) {
        callback({ success: false, error });
      } else {
        callback({ success: false });
      }
    }
  };

  const unSubscribePresenceSet = async (channelName: string) => {
    try {
      console.log(
        `[${socket.id}] Unsubscribing from presence set for channel: ${channelName}`
      );
      await socket.leave(`presence:${channelName}`);
      console.log(
        `[${socket.id}] Successfully unsubscribed from presence set for channel: ${channelName}`
      );
    } catch (error) {
      console.error(
        `[${socket.id}] Error unsubscribing from presence set:`,
        error
      );
    }
  };

  const updateUserInfo = async (
    channelName: string,
    updatedUserInfo: UserInfo
  ) => {
    try {
      console.log(
        `[${socket.id}] Updating user info in channel: ${channelName}`
      );
      const result = await presenceManager.updateUserInfo(
        socket.id,
        channelName,
        updatedUserInfo
      );

      io.to(`presence:${channelName}`).emit(
        `presence:${channelName}:update`,
        result
      );
      console.log(
        `[${socket.id}] Successfully updated user info in channel: ${channelName}`
      );
    } catch (error) {
      console.error(`[${socket.id}] Error updating user info:`, error);
    }
  };

  const handlePresenceDisconnection = async () => {
    try {
      console.log(`[${socket.id}] Handling presence disconnection`);
      const channels = await presenceManager.getUserChannels(socket.id);
      await presenceManager.removeUserFromAllChannels(socket.id);
      for (const channelName of channels) {
        io.to(`presence:${channelName}`).emit(
          `presence:${channelName}:leave`,
          socket.id
        );
      }
      console.log(`[${socket.id}] Successfully handled presence disconnection`);
    } catch (error) {
      console.error(
        `[${socket.id}] Error handling presence disconnection:`,
        error
      );
    }
  };

  socket.on("presenceSet:enter", enterPresenceSet);
  socket.on("presenceSet:leave", leavePresenceSet);
  socket.on("presence:subscribe", subscribePresenceSet);
  socket.on("presence:unsubscribe", unSubscribePresenceSet);
  socket.on("presence:update", updateUserInfo);
  socket.on("disconnect", handlePresenceDisconnection);
};
