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

// Error handling
socket.on('connect_error', (error) => {
  console.error('Socket.IO Connection Error: ', error);
});
