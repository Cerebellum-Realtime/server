import { Item } from "dynamoose/dist/Item";

export interface Channel extends Item {
  channelName: string;
}
