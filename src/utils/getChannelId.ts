import { DB } from "../utils/db";
const db = new DB();

export const getChannelId = async (channelName: string) => {
  const channelInfo = await db.getChannel(channelName);
  if (!channelInfo) return "Channel Name does not exist";

  return channelInfo.channelId;
};
