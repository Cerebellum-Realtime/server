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
      await socket.join(`presence:${channelName}`);

      const userPresence = await presenceManager.addUserToChannel(
        channelName,
        socket.id,
        userInfo
      );

      io.to(`presence:${channelName}`).emit(
        `presence:${channelName}:join`,
        userPresence
      );
    } catch (error) {
      console.error(`[${socket.id}] Error entering presence set:`, error);
    }
  };

  //subscribePresenceChannel
  const getPresenceMembersForChannel = async (
    channelName: string,
    callback: PresenceCallback
  ) => {
    try {
      const users = await presenceManager.getAllUsersInChannel(channelName);
      console.log(users);
      callback({ success: true, users });
    } catch (error) {
      if (error instanceof Error) {
        callback({ success: false, error });
      } else {
        callback({ success: false });
      }
    }
  };

  const leavePresenceSet = async (channelName: string) => {
    try {
      const [userPresenceLeft] = await Promise.all([
        presenceManager.removeUserFromChannel(channelName, socket.id),

        socket.leave(`presence:${channelName}`),
      ]);

      io.to(`presence:${channelName}`).emit(
        `presence:${channelName}:leave`,
        userPresenceLeft
      );
    } catch (error) {
      console.error(`[${socket.id}] Error leaving presence set:`, error);
    }
  };

  const updateUserInfo = async (
    channelName: string,
    updatedUserInfo: UserInfo
  ) => {
    try {
      const result = await presenceManager.updateUserInfo(
        socket.id,
        channelName,
        updatedUserInfo
      );

      io.to(`presence:${channelName}`).emit(
        `presence:${channelName}:update`,
        result
      );
    } catch (error) {
      console.error(`[${socket.id}] Error updating user info:`, error);
    }
  };

  const handlePresenceDisconnection = async () => {
    try {
      const channels = await presenceManager.getUserChannels(socket.id);
      await presenceManager.removeUserFromAllChannels(socket.id);
      for (const channelName of channels) {
        io.to(`presence:${channelName}`).emit(
          `presence:${channelName}:leave`,
          socket.id
        );
      }
    } catch (error) {
      console.error(
        `[${socket.id}] Error handling presence disconnection:`,
        error
      );
    }
  };

  socket.on("presenceSet:enter", enterPresenceSet);
  socket.on("presenceSet:leave", leavePresenceSet);
  socket.on("presence:members:get", getPresenceMembersForChannel);
  socket.on("presence:update", updateUserInfo);
  socket.on("disconnect", handlePresenceDisconnection);
};
