import { Schema, model } from "dynamoose";
import { Channel as ChannelType } from "../types/Channel";
import dotenv from "dotenv";
dotenv.config();

export const channelSchema = new Schema({
  channelName: {
    type: String,
    hashKey: true,
    required: true,
  }
});

export const Channel = model<ChannelType>(
  process.env.DYNAMODB_CHANNELS_TABLE_NAME || "channels",
  channelSchema
);
