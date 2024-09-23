import { WebSocketServer } from 'ws';

import { NUM_QNS } from './constants';
import { generateUniqueId } from '@quiz-lib/utils';
import { messageHandler } from './messageHandler';
import { log } from './logger';

log('info', `Configured with NUM_QNS=${NUM_QNS}`);

const PORT = Number(process.env.PORT) || 8081;

// NB: host arg required to bind to all interfaces to allow Postman testing
const wss = new WebSocketServer({ port: PORT, host: '0.0.0.0' });
log('info', `WebSocket server listening on port: ${PORT}`);

// ToDo: implement players and allow connections to be transient
const players: { [k: string]: any } = {};

wss.on('connection', async (ws) => {
  const playerId = generateUniqueId('player');
  const player = {
    id: playerId,
  };

  players[playerId] = player;
  log('info', 'Player connected', playerId);

  ws.onerror = function (error) {
    log('error', 'WebSocket Error', playerId, error);
  };

  ws.send(
    JSON.stringify({ mType: 'new-game', text: 'Do you want to play a quiz?' }),
  );

  ws.on(
    'message',
    async (message) => await messageHandler(ws, message, player),
  );

  ws.on('close', () => {
    log('info', 'Player disconnected', playerId);
    delete players[playerId];
  });
});
