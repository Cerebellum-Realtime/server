import dotenv from "dotenv";
import app from "./app";
import { Server, Socket } from "socket.io";
import { registerSubscriptionHandlers } from "./handlers/subscriptionHandler";
import { registerQueueHandlers } from "./handlers/queueHandler";
import { registerDisconnection } from "./handlers/disconnection";
import { redisStreamsClient } from "./config/redis";
import { createAdapter } from "@socket.io/redis-streams-adapter";
import { registerPresenceHandlers } from "./handlers/presenceHandler";
import { authenticate } from "./middleware/authenticate";
import { setupDatabase } from "./config/database";
dotenv.config();

setupDatabase();

const io = new Server({
  pingInterval: 30000,
  pingTimeout: 30000,

  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true,
  },
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  adapter: createAdapter(redisStreamsClient),
});

const onConnection = (socket: Socket) => {
  console.log(socket.id, " connected");
  registerSubscriptionHandlers(socket);
  registerQueueHandlers(io, socket);
  registerPresenceHandlers(io, socket);
  registerDisconnection(socket);
};
console.log(process.env);
io.use(authenticate);

io.on("connection", (socket: Socket) => {
  onConnection(socket);
});

app.listen(3000, () => {
  console.log(`HealthCheck Server is running at http://localhost:3000`);
});

io.listen(8001);
