import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const API_KEY = process.env.API_KEY || "sample key";
const login = express.Router();

login.post("/", (req: Request, res: Response) => {
  const { username } = req.body;

  if (username === "fakeUser") {
    return res
      .status(200)
      .send(jwt.sign({ username: "fakeUser" }, "fakeApiKey"));
  }

  const token = jwt.sign({ username }, API_KEY, {
    expiresIn: "1m",
  });

  return res.status(200).send(token);
});

export default login;
