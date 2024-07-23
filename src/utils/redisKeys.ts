import dotenv from "dotenv";
dotenv.config();

const createChannelKey = (channelName: string): string =>
  `channel:${channelName}`;
const createChannelUserKey = (channelName: string, socketId: string): string =>
  `user:${channelName}:${socketId}`;
const createUserChannelsKey = (socketId: string): string =>
  `user:${socketId}:channels`;
const createContainerUserKey = (): string =>
  `container:${process.env.CONTAINER_ID}`;

export {
  createChannelKey,
  createChannelUserKey,
  createUserChannelsKey,
  createContainerUserKey,
};
