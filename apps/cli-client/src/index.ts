import { io, Socket } from 'socket.io-client';
import { messageHandler } from './messageHandler';

const PORT = Number(process.env.PORT) || 8081;
const HOST = process.env.HOST || 'localhost';

const socket: Socket = io(`http://${HOST}:${PORT}`);

// Handle incoming messages from the server
socket.on(
  'message',
  async (message: any) => await messageHandler(socket, message),
);

// socket.on('new-game', async (message) => await messageHandler(socket, message));
// socket.on('question', async (message) => await messageHandler(socket, message));
// socket.on('grading', async (message) => await messageHandler(socket, message));
// socket.on('score', async (message) => await messageHandler(socket, message));
// socket.on('text', async (message) => await messageHandler(socket, message));

// Error handling
socket.on('connect_error', (error) => {
  console.error('Socket.IO Connection Error: ', error);
});

// import { WebSocket } from 'ws';
// import { messageHandler } from './messageHandler';

// const PORT = Number(process.env.PORT) || 8081;
// const HOST = process.env.HOST || 'localhost';

// const ws = new WebSocket(`ws://${HOST}:${PORT}`);

// ws.on('message', async (message) => await messageHandler(ws, message));

// ws.onerror = function (error) {
//   console.error('WebSocket Error: ', error);
// };
