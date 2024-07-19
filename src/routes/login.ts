import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Cerebellum } from "../utils/token";
import dotenv from "dotenv";
dotenv.config();
const API_KEY = process.env.API_KEY || "sample key";
const login = express.Router();
console.log("api key: ", API_KEY);
const cerebellum = new Cerebellum(API_KEY);

login.post("/", (req: Request, res: Response) => {
  const { username } = req.body;

  // Demo bad user creds:
  if (username === "fakeUser") {
    return res
      .status(200)
      .send(jwt.sign({ username: "fakeUser" }, "fakeApiKey"));
  }
  // Dev using Cerebellum validates user credentials and calls `createTokenRequest` if valid
  const token = cerebellum.createToken({ username }); // Create signed token w/ payload as user & secret as API key

  console.log("signed token: ", token);
  return res.status(200).send(token);
});

export default login;
