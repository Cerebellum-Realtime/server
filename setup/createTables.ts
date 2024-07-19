import {
  CreateTableCommand,
  CreateTableCommandInput,
} from "@aws-sdk/client-dynamodb";
import { ddbDocClient } from "./dynamo";

async function createChannelsTable() {
  const params: CreateTableCommandInput = {
    TableName: "channels",
    KeySchema: [
      { AttributeName: "channelName", KeyType: "HASH" }, // Partition key
    ],
    AttributeDefinitions: [
      { AttributeName: "channelName", AttributeType: "S" },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  };

  try {
    const data = await ddbDocClient.send(new CreateTableCommand(params));
    console.log("Channels Table created:", data);
  } catch (error) {
    console.error("Error creating Channels Table:", error);
  }
}

async function createMessagesTable() {
  const params: CreateTableCommandInput = {
    TableName: "messages",
    KeySchema: [
      { AttributeName: "channelId", KeyType: "HASH" },
      { AttributeName: "createdAt_messageId", KeyType: "RANGE" },
    ],
    AttributeDefinitions: [
      { AttributeName: "channelId", AttributeType: "S" },
      { AttributeName: "createdAt_messageId", AttributeType: "S" },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  };

  try {
    const data = await ddbDocClient.send(new CreateTableCommand(params));
    console.log("Messages Table created:", data);
  } catch (error) {
    console.error("Error creating Messages Table:", error);
  }
}

const createSampleTables = async () => {
  await createChannelsTable();
  await createMessagesTable();
};

createSampleTables();
