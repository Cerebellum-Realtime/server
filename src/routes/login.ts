import express, { Request, Response } from "express";
import { SignJWT } from "jose";
import dotenv from "dotenv";
dotenv.config();
const API_KEY = process.env.API_KEY || "SAMPLE_API_KEY";
const login = express.Router();

login.post("/", async (req: Request, res: Response) => {
  const { username } = req.body;

  if (username === "fakeUser") {
    const token = await new SignJWT({ username: "fakeUser" })
      .setExpirationTime("1m")
      .setProtectedHeader({ alg: "HS256" })
      .sign(new TextEncoder().encode("fakeAPIKey"));

    return res.status(200).send(token);
  }

  const token = await new SignJWT({ username })
    .setExpirationTime("1m")
    .setProtectedHeader({ alg: "HS256" })
    .sign(new TextEncoder().encode(API_KEY));

  return res.status(200).send(token);
});

export default login;
