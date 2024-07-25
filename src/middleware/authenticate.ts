import { jwtVerify } from "jose";
import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";

const secret = process.env.API_KEY || "sample key";

const isValid = async (socket: Socket): Promise<boolean> => {
  const token: string | undefined = socket.handshake.auth.token;
  if (!token) return false;

  try {
    // Create a SecretKey from the secret key
    // const key = createSecretKey(secret, "utf-8");
    const textEncode = new TextEncoder().encode(secret);
    console.log("Token: ", token);
    // Verify the token
    const result = await jwtVerify(token, textEncode, {
      algorithms: ["HS256"], // Specify the algorithm used for signing
    });

    console.log("Result: ", result);

    return true;
  } catch (error) {
    console.error("Bad token: ", error);
    return false;
  }
};

export const authenticate = async (
  socket: Socket,
  next: (err?: ExtendedError | undefined) => void
) => {
  if (!(await isValid(socket))) {
    console.log("Auth token not provided or invalid");
    socket.disconnect(true);
    return next(new Error("Authentication error"));
  }

  next();
};
