import jwt from "jsonwebtoken";
import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import { JwtPayload } from "jsonwebtoken";
const secret = process.env.API_KEY || "sample key"; // This secret must match the secret used in the `/login` route
// Store this in AWS secrets and make it part of CDK
const isValid = (socket: Socket) => {
  const token: string | undefined = socket.handshake.auth.token;
  if (!token) return false;

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, secret);
  } catch (error) {
    console.error("Bad token: ", error);
    return false;
  }

  console.log("Decoded token: ", decodedToken);
  return true;
};

export const authenticate = (
  socket: Socket,
  next: (err?: ExtendedError | undefined) => void
) => {
  console.log("Started auth process");

  if (!isValid(socket)) {
    console.log("Auth token not provided or invalid");
    socket.disconnect(true);
    return next(new Error("Authentication error"));
  }

  console.log("Auth process successful");
  next();
};
