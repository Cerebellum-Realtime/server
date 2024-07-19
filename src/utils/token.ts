import jwt from "jsonwebtoken";

export interface Cerebellum {
  apiKey: string;
}

interface Payload {
  username: string;
}

export class Cerebellum {
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  createToken(payload: Payload) {
    return jwt.sign(payload, this.apiKey, {
      expiresIn: "1m",
    });
  }
}
