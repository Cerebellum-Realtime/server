import express, { Request, Response } from "express";

const healthCheck = express.Router();

healthCheck.get("/", (req: Request, res: Response) => {
  res.status(200).send("Server is healthy");
});

export default healthCheck;
