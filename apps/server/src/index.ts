import { WebSocketServer } from 'ws';

import { generateUniqueId } from '@quiz-lib/utils';
import { messageHandler } from './messageHandler';

const PORT = Number(process.env.PORT) || 8081;

// NB: host arg required to bind to all interfaces to allow Postman testing
const wss = new WebSocketServer({ port: PORT, host: '0.0.0.0' });
console.log(`WebSocket server listening on port: ${PORT}`);

// ToDo: implement players and allow connections to be transient
const players: { [k: string]: any } = {};

wss.on('connection', async (ws) => {
  const playerId = generateUniqueId('player');
  const player = {
    id: playerId,
  };

  players[playerId] = player;
  console.log(`Player connected: ${playerId}`);

  ws.onerror = function (error) {
    console.error('WebSocket Error: ', error);
  };

  ws.send(
    JSON.stringify({ mType: 'new-game', text: 'Do you want to play a quiz?' }),
  );

  ws.on(
    'message',
    async (message) => await messageHandler(ws, message, player),
  );

  ws.on('close', () => {
    console.log(`Player disconnected: ${playerId}`);
    delete players[playerId];
  });
});
