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
app.use("/login", login); // Dev would provide this route to generate single use token for connection

export default app;
