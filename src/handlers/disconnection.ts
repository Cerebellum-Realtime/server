import { Socket } from "socket.io";

export const registerDisconnection = (socket: Socket) => {
  const disconnect = (reason: string) => {
    console.log(`Socket ${socket.id} disconnected: ${reason}`);
  };

  socket.on("disconnect", disconnect);
};
