import { io, Socket } from 'socket.io-client';

import { generateUniqueId } from '@quiz-lib/utils';
import { ClientState, messageHandler } from './messageHandler';

const PORT = Number(process.env.PORT) || 8081;
const HOST = process.env.HOST || 'localhost';

let state: ClientState = {
  quit: false,
};

interface Auth {
  playerId?: string;
  msgOffset?: number;
}

interface SocketWithAuth extends Socket {
  auth: Auth;
}

const socket = io(`http://${HOST}:${PORT}`, {
  auth: {
    playerId: generateUniqueId('player'),
    msgOffset: 0,
  },
}) as SocketWithAuth;

// Handle incoming messages from the server
socket.on('message', async (message: any, serverOffset: number) => {
  socket.auth.msgOffset = serverOffset;
  await messageHandler(socket, message, state);
});

// Error handling
socket.on('connect_error', (error) => {
  console.error('Socket.IO Connection Error: ', error);
});

socket.on('disconnect', (reason) => {
  if (!state.quit) {
    console.log(
      `Disconnected from server (${reason}), reconnecting in 2 seconds...`,
    );
    process.stdin.pause();

    setTimeout(() => {
      socket.connect();
      process.stdout.write('\u001b[1A'); // Move cursor up one line
      process.stdout.write('\u001b[2K'); // Clear the line
      process.stdin.resume();
    }, 2000);
  }
});
