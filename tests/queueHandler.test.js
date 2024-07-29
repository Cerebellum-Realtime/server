import { beforeAll, afterAll, describe, it, expect, beforeEach } from "vitest";
import { createServer } from "node:http";
import { io as ioc } from "socket.io-client";
import { Server } from "socket.io";
import { registerQueueHandlers } from "../src/handlers/queueHandler";

vi.mock("../src/utils/queue", () => ({
  handleSendMessageToQueue: vi
    .fn()
    .mockImplementation(async (channelName, message, createdAt) => {
      // mocked to avoid testing redis
    }),
}));

vi.mock("../src/utils/presence", () => {
  return {
    ChannelPresenceManager: vi.fn().mockImplementation(() => ({
      addUserToChannel: vi
        .fn()
        .mockResolvedValue({ username: "cerebellumUser" }),
    })),
  };
});

describe("queue handler", () => {
  let io, serverSocket, clientSocket, port;

  beforeAll(() => {
    return new Promise((resolve) => {
      const httpServer = createServer();
      io = new Server(httpServer);
      httpServer.listen(() => {
        port = httpServer.address().port;

        io.on("connection", (socket) => {
          registerQueueHandlers(io, socket);
          serverSocket = socket;
        });

        resolve();
      });
    });
  });

  beforeEach(() => {
    return new Promise((resolve) => {
      clientSocket = ioc(`http://localhost:${port}`);

      io.on("connection", (socket) => {
        socket.on("joinRoom", (room) => {
          socket.join(room);
        });
      });

      clientSocket.on("connect", () => {
        clientSocket.emit("joinRoom", "test-channel");
        resolve();
      });
    });
  });

  afterEach(() => {
    clientSocket.disconnect();
    clientSocket = undefined;
  });

  afterAll(() => {
    io.close();
  });

  it("should emit the message sent to the queue", () => {
    return new Promise((resolve) => {
      clientSocket.on("message:receive:test-channel", (ack) => {
        expect(ack).toEqual({
          createdAt: expect.any(String),
          content: "hello!",
          socketId: clientSocket.id,
        });

        resolve();
      });

      clientSocket.emit("message:queue", "test-channel", "hello!");
    });
  });
});
