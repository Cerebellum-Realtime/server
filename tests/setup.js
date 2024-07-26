import { beforeEach, beforeAll, afterEach } from "node:test";

beforeAll(() => {
  return new Promise((resolve) => {
    httpServer = createServer();
    io = new Server(httpServer);
    io.on("connection", (socket) => {
      registerPresenceHandlers(io, socket);
      serverSocket = socket;
    });
    httpServer.listen(() => {
      resolve();
    });
  });
});

beforeEach(() => {
  return new Promise((resolve) => {
    const port = httpServer.address().port;

    clientSocket = ioc(`http://localhost:${port}`);
    disconnectSocket = ioc(`http://localhost:${port}`);

    let connections = 0;
    const checkCompletion = () => {
      connections += 1;
      if (connections === 2) {
        resolve();
      }
    };

    clientSocket.on("connect", checkCompletion);
    disconnectSocket.on("connect", checkCompletion);
  });
});

afterEach(() => {
  clientSocket.close();
  disconnectSocket.close();
});

afterAll(() => {
  io.close();
  httpServer.close();
});
