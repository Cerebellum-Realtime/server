import { Schema, model } from "dynamoose";
import { Item } from "dynamoose/dist/Item";

interface Channel extends Item {
  channelName: string;
  channelId: string;
}

export const channelSchema = new Schema({
  channelName: {
    type: String,
    hashKey: true,
  },
  channelId: {
    type: String,
    required: true,
  },
});

export const Channel = model<Channel>("channels", channelSchema);
