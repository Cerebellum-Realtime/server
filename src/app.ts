import express, { Express } from "express";
import cors from "cors";
import healthCheck from "./routes/healthCheck";
import login from "./routes/login";

const app: Express = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
  })
);

app.use(express.json());

app.use("/", healthCheck);

if (process.env.NODE_ENV === "development") {
  app.use("/login", login);
}

export default app;
