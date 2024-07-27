import { beforeAll, afterAll, describe, it, expect, beforeEach } from "vitest";
import { createServer } from "node:http";
import { io as ioc } from "socket.io-client";
import { Server } from "socket.io";
import { registerPresenceHandlers } from "../src/handlers/presenceHandler";
import { ChannelPresenceManager } from "../src/utils/presence";

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
  let io, serverSocket, clientSocket, disconnectSocket, port;

  beforeAll(() => {
    return new Promise((resolve) => {
      const httpServer = createServer();
      io = new Server(httpServer);
      httpServer.listen(() => {
        port = httpServer.address().port;

        io.on("connection", (socket) => {
          registerPresenceHandlers(io, socket);
          serverSocket = socket;
        });

        resolve();
      });
    });
  });

  beforeEach(() => {
    return new Promise((resolve) => {
      clientSocket = ioc(`http://localhost:${port}`);
      disconnectSocket = ioc(`http://localhost:${port}`);

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

  afterEach(() => {
    clientSocket.disconnect();
    clientSocket = undefined;
    disconnectSocket.disconnect();
    disconnectSocket = undefined;
  });

  afterAll(() => {
    io.close();
  });

  it("should enter a presence set", () => {
    return new Promise((resolve) => {
      clientSocket.emit("presenceSet:enter", "test-channel", {
        userName: "cerebellumUser",
      });

      clientSocket.on("presence:test-channel:join", (data) => {
        expect(data).toEqual({ username: "cerebellumUser" });
        resolve();
      });
    });
  });

  it("should leave a presence set", () => {
    return new Promise((resolve) => {
      clientSocket.emit("presenceSet:enter", "test-channel");

      clientSocket.on("presence:test-channel:leave", (data) => {
        expect(data).toEqual({ socketId: disconnectSocket.id });
        resolve();
      });

      setTimeout(() => {
        disconnectSocket.emit("presenceSet:leave", "test-channel");
      }, 200);
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
      clientSocket.emit("presenceSet:enter", "test-channel");
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

      setTimeout(() => {
        disconnectSocket.disconnect();
      }, 200);
    });
  });
});
