import { Item } from "dynamoose/dist/Item";

export interface Message extends Item {
  channelName: string;
  messageId: string;
  content: string;
  createdAt: string;
}

export interface MessageBody
  extends Pick<Message, "channelName" | "messageId" | "content" | "createdAt"> {}
