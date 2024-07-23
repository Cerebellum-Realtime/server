import dotenv from "dotenv";
import http from "http";
import app from "./app";
import { Server, Socket } from "socket.io";
import { registerSubscriptionHandlers } from "./handlers/subscriptionHandler";
import { registerMessageHandlers } from "./handlers/messageHandler";
import { registerQueueHandlers } from "./handlers/queueHandler";
import { registerDisconnection } from "./handlers/disconnection";
import { pub } from "./config/redis";
import { createAdapter } from "@socket.io/redis-streams-adapter";
import * as dynamoose from "dynamoose";
import { registerPresenceHandlers } from "./handlers/presenceHandler";
import { authenticate } from "./middleware/authenticate";

dotenv.config();

const port = process.env.PORT || 8000;
const server = http.createServer(app);

if (process.env.NODE_ENV === "development") {
  dynamoose.aws.ddb.local("http://localhost:8001");
} else {
  // Create new DynamoDB instance
  const ddb = new dynamoose.aws.ddb.DynamoDB();
  // Set DynamoDB instance to the Dynamoose DDB instance
  dynamoose.aws.ddb.set(ddb);
}

// If you are running Dynamoose in an environment that has an IAM role attached to it (ex. Lambda or EC2),
// you do not need to do any additional configuration so
// long as your IAM role has appropriate permissions to access DynamoDB.

const io = new Server(server, {
  transports: ["websocket"],
  pingInterval: 10000, // defines length of time each ping packet is sent to ensure connection is still valid; setting to 10s for testing purposes
  pingTimeout: 10000, // defines length of time for the client to rend a pong packet before considering disconnected; setting to 10s for testing

  // the server will store the `id`, the rooms, and the `data` attribute of the socket
  connectionStateRecovery: {
    // the backup duration of the sessions and the packets
    maxDisconnectionDuration: 2 * 60 * 1000, // 2mins

    // whether to skip middlewares upon successful recovery
    skipMiddlewares: true,
  },
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.adapter(createAdapter(pub));

const onConnection = (socket: Socket) => {
  console.log(socket.id, " connected");
  io.emit("recovery:enable"); // Nominal – the server must send at least one event in order to initialize the offset on the client side
  registerSubscriptionHandlers(io, socket);
  registerMessageHandlers(io, socket);
  registerQueueHandlers(io, socket);
  registerPresenceHandlers(io, socket);
  registerDisconnection(socket);
};

io.use(authenticate);

io.on("connection", (socket: Socket) => {
  onConnection(socket);
  console.log("Connection made");
});

server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
