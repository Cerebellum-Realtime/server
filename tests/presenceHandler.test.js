import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { createServer } from "node:http";
import { io as ioc } from "socket.io-client";
import { Server } from "socket.io";
import { registerPresenceHandlers } from "../src/handlers/presenceHandler";
import { ChannelPresenceManager } from "../src/utils/presence";
import { beforeEach } from "node:test";

vi.mock("../src/utils/presence", () => {
  return {
    ChannelPresenceManager: vi.fn().mockImplementation(() => ({
      addUserToChannel: vi
        .fn()
        .mockResolvedValue({ username: "cerebellumUser" }),
      removeUserFromChannel: vi.fn().mockResolvedValue(),
      getAllUsersInChannel: vi
        .fn()
        .mockResolvedValue([
          { username: "cerebellumUser1" },
          { username: "cerebellumUser2" },
        ]),
      updateUserInfo: vi
        .fn()
        .mockResolvedValue([
          { username: "cerebellumUser1" },
          { username: "cerebellumUser2" },
          { username: "cerebellumUser3" },
        ]),
      getUserChannels: vi.fn().mockResolvedValue(["test-channel"]),
      removeUserFromAllChannels: vi.fn().mockResolvedValue(),
    })),
  };
});

describe("presence handler", () => {
  let io, serverSocket, clientSocket, disconnectSocket;

  beforeAll(() => {
    return new Promise((resolve) => {
      const httpServer = createServer();
      io = new Server(httpServer);
      httpServer.listen(() => {
        const port = httpServer.address().port;

        clientSocket = ioc(`http://localhost:${port}`);
        disconnectSocket = ioc(`http://localhost:${port}`);

        io.on("connection", (socket) => {
          registerPresenceHandlers(io, socket);
          serverSocket = socket;
        });

        let connections = 0;
        const checkCompletion = () => {
          connections += 1;
          if (connections === 2) {
            resolve();
          }
        };

        clientSocket.on("connect", checkCompletion);
        disconnectSocket.on("connect", checkCompletion);
      });
    });
  });

  it("should enter a presence set", () => {
    return new Promise((resolve) => {
      clientSocket.emit("presenceSet:enter", "test-channel", {
        userName: "cerebellumUser", // This doesn't matter since we mocked return of addUserToChannel
      });

      clientSocket.on("presence:test-channel:join", (data) => {
        expect(data).toEqual({ username: "cerebellumUser" });
        resolve();
      });
    });
  });

  it("should leave a presence set", () => {
    clientSocket.emit("presenceSet:enter", "test-channel");

    return new Promise((resolve) => {
      clientSocket.on("presence:test-channel:leave", (data) => {
        expect(data).toEqual({ socketId: disconnectSocket.id });
        resolve();
      });

      disconnectSocket.emit("presenceSet:leave", "test-channel");
    });
  });

  it("should get a presence set", () => {
    return new Promise((resolve) => {
      clientSocket.emit("presence:members:get", "test-channel", (ack) => {
        expect(ack).toEqual({
          success: true,
          users: [
            { username: "cerebellumUser1" },
            { username: "cerebellumUser2" },
          ],
        });
        resolve();
      });
    });
  });

  it("should update a presence set", () => {
    return new Promise((resolve) => {
      clientSocket.emit("presence:update", "test-channel", {
        username: "cerebellumUser3",
      });

      clientSocket.on("presence:test-channel:update", (result) => {
        expect(result).toEqual([
          { username: "cerebellumUser1" },
          { username: "cerebellumUser2" },
          { username: "cerebellumUser3" },
        ]);
        resolve();
      });
    });
  });

  it("should disconnect from a presence set", () => {
    clientSocket.emit("presenceSet:enter", "test-channel");
    const disconnectedId = disconnectSocket.id;

    return new Promise((resolve) => {
      clientSocket.on(`presence:test-channel:leave`, (data) => {
        expect(data.socketId).toEqual(disconnectedId);
        resolve();
      });

      disconnectSocket.disconnect();
    });
  });
});
