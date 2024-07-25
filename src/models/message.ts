import * as dynamoose from "dynamoose";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { Message as MessageType } from "../types/Message";
dotenv.config();

const messageSchema = new dynamoose.Schema({
  channelName: {
    type: String,
    hashKey: true,
    required: true,
  },

  messageId: {
    type: String,
    rangeKey: true,
    default: () => {
      return uuidv4();
    },
  },
  content: {
    type: dynamoose.type.ANY,
    required: true,
  },
  createdAt: {
    type: String,
    index: {
      name: "createdAtIndex",
      type: "local",
    },
    required: true,
    default: () => {
      const now = new Date();
      return `${now.toISOString()}`;
    },
  },
});

// Define the Message model
export const Message = dynamoose.model<MessageType>(
  process.env.DYNAMODB_MESSAGES_TABLE_NAME || "messages",
  messageSchema
);
