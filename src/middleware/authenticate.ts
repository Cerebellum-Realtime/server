import jwt from "jsonwebtoken";
import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
const secret = process.env.API_KEY || "sample key"; 

const isValid = (socket: Socket) => {
  const token: string | undefined = socket.handshake.auth.token;
  if (!token) return false;

  try {
    jwt.verify(token, secret);
  } catch (error) {
    console.error("Bad token: ", error);
    return false;
  }

  return true;
};

export const authenticate = (
  socket: Socket,
  next: (err?: ExtendedError | undefined) => void
) => {
  if (!isValid(socket)) {
    console.log("Auth token not provided or invalid");
    socket.disconnect(true);
    return next(new Error("Authentication error"));
  }

  next();
};
