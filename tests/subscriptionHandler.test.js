import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { createServer } from "node:http";
import { io as ioc } from "socket.io-client";
import { Server } from "socket.io";
import { registerSubscriptionHandlers } from "../src/handlers/subscriptionHandler";

vi.mock("../src/utils/db", () => ({
  DB: vi.fn().mockImplementation(() => ({
    channelExists: vi.fn().mockResolvedValue(true),
    getMessagesForChannelPaginated: vi.fn().mockResolvedValue({
      contents: ["message1", "message2"],
      returnedLastEvaluatedKey: "lastKey",
    }),
  })),
}));

describe("subscription handler", () => {
  let io, serverSocket, clientSocket;

  beforeAll(() => {
    return new Promise((resolve) => {
      const httpServer = createServer();
      io = new Server(httpServer);
      httpServer.listen(() => {
        const port = httpServer.address().port;
        clientSocket = ioc(`http://localhost:${port}`);
        io.on("connection", (socket) => {
          registerSubscriptionHandlers(socket);
          serverSocket = socket;
        });
        clientSocket.on("connect", resolve);
      });
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.disconnect();
  });

  it("should subscribe to channels", () => {
    return new Promise((resolve, reject) => {
      clientSocket.emit("channel:subscribe", "test-channel", (ack) => {
        expect(ack.success).toBe(true);
        expect(serverSocket.rooms.has("test-channel")).toBe(true);
        resolve();
      });
    });
  });

  it("should unsubscribe from channels", () => {
    return new Promise((resolve, reject) => {
      clientSocket.emit("channel:unsubscribe", "test-channel", (ack) => {
        expect(ack.success).toBe(true);
        expect(serverSocket.rooms.has("test-channel")).toBe(false);
        resolve();
      });
    });
  });

  it("should get past messages", () => {
    return new Promise((resolve) => {
      clientSocket.emit(
        "channel:history",
        "test-channel",
        10,
        "ascending",
        undefined,
        (ack) => {
          expect(ack.success).toBe(true);
          expect(ack.pastMessages).toEqual(["message1", "message2"]);
          expect(ack.lastEvaluatedKey).toBe("lastKey");
          resolve();
        }
      );
    });
  });
});
