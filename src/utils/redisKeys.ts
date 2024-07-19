import dotenv from "dotenv";
dotenv.config();

const createChannelKey = (channelName: string): string =>
  `channel:${channelName}`;
const createChannelUserKey = (channelName: string, socketId: string): string =>
  `user:${channelName}:${socketId}`;
const createUserChannelsKey = (socketId: string): string =>
  `user:${socketId}:channels`;

export { createChannelKey, createChannelUserKey, createUserChannelsKey };
