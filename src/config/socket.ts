import { Emitter } from "@socket.io/redis-emitter";
import { pub } from "./redis";

let emitterInstance: Emitter;

export const createIoEmitter = () => {
  const emitter = new Emitter(pub);

  emitterInstance = emitter;
};

export const getEmitterInstance = () => {
  if (!emitterInstance) {
    throw new Error("Socket.io instance has not been initialized.");
  }
  return emitterInstance;
};
