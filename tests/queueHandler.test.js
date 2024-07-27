import { beforeAll, afterAll, describe, it, expect, beforeEach } from "vitest";
import { createServer } from "node:http";
import { io as ioc } from "socket.io-client";
import { Server } from "socket.io";
import { registerQueueHandlers } from "../src/handlers/queueHandler";
import { handleSendMessageToQueue } from "../src/utils/queue";

vi.mock("../src/utils/queue", () => ({
  handleSendMessageToQueue: vi
    .fn()
    .mockImplementation(async (channelName, message, createdAt) => {
      // Simply do nothing or simulate the expected behavior
      console.log(
        `Mocked handleSendMessageToQueue called with: ${channelName}, ${message}, ${createdAt}`
      );
    }),
}));

vi.mock("../src/utils/db", () => ({
  DB: vi.fn().mockImplementation(() => ({
    channelExists: vi.fn().mockResolvedValue(true),
    getMessagesForChannelPaginated: vi.fn().mockResolvedValue({
      contents: ["message1", "message2"],
      returnedLastEvaluatedKey: "lastKey",
    }),
  })),
}));

describe("queue handler", () => {
  let io, serverSocket, clientSocket, disconnectSocket, port;

  beforeAll(() => {
    return new Promise((resolve) => {
      const httpServer = createServer();
      io = new Server(httpServer);
      httpServer.listen(() => {
        port = httpServer.address().port;

        io.on("connection", (socket) => {
          registerQueueHandlers(io, socket);
          console.log("registered q handler");
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

  it("should emit the message sent to the queue", () => {
    return new Promise((resolve) => {
      // Ensure the client joins the room
      clientSocket.emit("channel:subscribe", "test-channel", (ack) => {
        console.log("we joined");
        // expect(ack.success).toBe(true);
        // expect(serverSocket.rooms.has("test-channel")).toBe(true);
        // resolve();
      });

      // Handle the received message
      // clientSocket.on("message:receive:test-channel", (ack) => {
      //   console.log("ack: ", ack);
      //   expect(ack).toEqual({
      //     createdAt: expect.any(String),
      //     content: "hello!",
      //     socketId: clientSocket.id,
      //   });
      //   resolve();
      // });

      // Emit the message after ensuring the socket is connected
      setTimeout(() => {
        clientSocket.emit("message:queue", "test-channel", "hello!");
      }, 100);
    });
  });
});
