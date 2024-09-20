import { WebSocket } from 'ws';
import { messageHandler } from './messageHandler';

const PORT = Number(process.env.PORT) || 8081;
const HOST = process.env.HOST || 'localhost';

const ws = new WebSocket(`ws://${HOST}:${PORT}`);

ws.on('message', async (message) => await messageHandler(ws, message));

ws.onerror = function (error) {
  console.error('WebSocket Error: ', error);
};
