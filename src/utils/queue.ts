import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { v4 as uuidv4 } from "uuid";
import { MessageBody } from "../types/Message";
import { DB } from "./db";
import dotenv from "dotenv";
dotenv.config();

const queueUrl: string = process.env.QUEUE_URL || "";
const sqs = new SQSClient();
const db = new DB();

export const handleSendMessageToQueue = (
  channelName: string,
  message: string,
  createdAt: string
) => {
  if (process.env.NODE_ENV === "development") {
    db.saveMessage(channelName, message, createdAt);
  } else {
    sendMessageToQueue(channelName, message, createdAt);
  }
};

const sendMessageToQueue = async (
  channelName: string,
  message: string,
  createdAt: string
): Promise<void> => {
  const messageBody: MessageBody = {
    channelName,
    messageId: uuidv4(),
    content: message,
    createdAt,
  };

  const params = {
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify(messageBody),
  };

  try {
    const result = await sqs.send(new SendMessageCommand(params));
    console.log("Message sent:", result.MessageId);
  } catch (error) {
    console.error("Error sending message:", error);
  }
};
