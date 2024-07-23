import { Channel } from "../models/channel";
import { Message } from "../models/message";
import { Message as MessageType } from "../types/Message";

export class DB {
  async channelExists(channelName: string): Promise<void> {
    const existingChannel = await this.getChannel(channelName);

    if (!existingChannel) await this.addChannel(channelName);
  }

  async addChannel(channelName: string): Promise<void> {
    try {
      const newChannel = new Channel({
        channelName: channelName,
      });

      await newChannel.save();
    } catch (error) {
      console.error("Error adding channel:", error);
      throw error;
    }
  }

  async getChannel(channelName: string) {
    try {
      const channel = await Channel.query("channelName").eq(channelName).exec();
      return channel[0];
    } catch (error) {
      console.error("Error fetching channel:", error);
    }
  }

  async saveMessage(channelName: string, content: string, createdAt: string) {
    try {
      const newMessage = new Message({
        channelName,
        content,
        createdAt,
      });

      await newMessage.save();
      console.log("Message saved successfully");
    } catch (error) {
      console.error("Error saving message:", error);
    }
  }

  async getMessagesForChannelPaginated(
    channelName: string,
    limit: number = 50,
    sortDirection: "ascending" | "descending" = "ascending",
    lastEvaluatedKey?: MessageType
  ) {
    try {
      let query = Message.query("channelName")
        .eq(channelName)
        .using("createdAtIndex")
        .sort(sortDirection)
        .limit(limit);

      if (lastEvaluatedKey) {
        query = query.startAt(lastEvaluatedKey);
      }

      const result = await query.exec();
      if (result.length === 0) {
        return { contents: [], returnedLastEvaluatedKey: undefined };
      }

      const contents = result.map((message) => {
        return {
          content: message.content,
          createdAt: message.createdAt,
        };
      });

      return {
        contents,
        returnedLastEvaluatedKey: result.lastKey,
      };
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  }

  async getAllMessagesForChannel(channelName: string) {
    console.log(channelName);
    try {
      const result = await Message.query("channelName")
        .eq(channelName)
        .using("createdAtIndex")
        .sort("ascending")
        .exec();

      const contents = result.map((message) => {
        return {
          content: message.content,
          createdAt: message.createdAt,
        };
      });

      return { contents, lastEvaluatedKey: result.lastKey };
    } catch (error) {
      console.error("Error retrieving messages for channel:", error);
      throw error;
    }
  }
}
