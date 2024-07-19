import { Redis } from "ioredis";
import { redisStreamsClient } from "../config/redis";
import {
  createChannelKey,
  createChannelUserKey,
  createUserChannelsKey,
} from "./redisKeys";

interface UserInfo {
  [key: string]: string;
}

export class ChannelPresenceManager {
  private redis: Redis;

  constructor() {
    this.redis = redisStreamsClient;
  }

  async addUserToChannel(
    channelName: string,
    socketId: string,
    userInfo: UserInfo
  ): Promise<UserInfo> {
    const multi = this.redis.multi();
    const userInfoWithSocketId = { ...userInfo, socketId };

    const userInfoWithStrings = Object.fromEntries(
      Object.entries(userInfoWithSocketId).map(([key, value]) => [
        key,
        String(value),
      ])
    );

    const channelKey = createChannelKey(channelName);
    const userKey = createChannelUserKey(channelName, socketId);
    const userChannelsKey = createUserChannelsKey(socketId);

    multi.sadd(channelKey, socketId);
    multi.hmset(userKey, userInfoWithStrings);
    multi.sadd(userChannelsKey, channelName);
    await multi.exec();

    return userInfoWithStrings;
  }

  async removeUserFromChannel(
    channelName: string,
    socketId: string
  ): Promise<void> {
    const channelKey = createChannelKey(channelName);
    const userKey = createChannelUserKey(channelName, socketId);
    const userChannelsKey = createUserChannelsKey(socketId);
    const multi = this.redis.multi();

    multi.srem(channelKey, socketId);
    multi.del(userKey);
    multi.srem(userChannelsKey, channelName);
    await multi.exec();
  }

  async getAllUsersInChannel(channelName: string): Promise<UserInfo[]> {
    const channelKey = createChannelKey(channelName);

    const socketIds = await this.redis.smembers(channelKey);

    const multi = this.redis.multi();

    socketIds.forEach((socketId) => {
      const userKey = createChannelUserKey(channelName, socketId);
      multi.hgetall(userKey);
    });

    const result = await multi.exec();
    if (result === null) return [];

    const users = result.map(([err, userInfo]) => {
      return userInfo as UserInfo;
    });

    return users;
  }

  async updateUserInfo(
    socketId: string,
    channelName: string,
    updatedUserInfo: UserInfo
  ) {
    const userKey = createChannelUserKey(channelName, socketId);
    const userInfo = await this.redis.hgetall(userKey);
    const mergedUserInfo = Object.fromEntries(
      Object.entries({ ...userInfo, ...updatedUserInfo }).map(
        ([key, value]) => [key, String(value)]
      )
    );

    await this.redis.hmset(userKey, mergedUserInfo);

    return mergedUserInfo;
  }

  async getUserChannels(socketId: string): Promise<string[]> {
    const userChannelsKey = createUserChannelsKey(socketId);
    return await this.redis.smembers(userChannelsKey);
  }

  async removeUserFromAllChannels(socketId: string): Promise<void> {
    const channels = await this.getUserChannels(socketId);
    const multi = this.redis.multi();

    for (const channel of channels) {
      const channelKey = createChannelKey(channel);
      const userKey = createChannelUserKey(channel, socketId);
      multi.srem(channelKey, socketId);
      multi.del(userKey);
    }

    const userChannelsKey = createUserChannelsKey(socketId);

    multi.del(userChannelsKey);
    await multi.exec();
  }
}
