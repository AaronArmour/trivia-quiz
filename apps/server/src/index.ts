import { createServer } from 'http';
import { Server } from 'socket.io';

import { NUM_QNS } from './constants';
import { generateUniqueId } from '@quiz-lib/utils';
import { messageHandler } from './messageHandler';
import { log } from './logger';
import { ServerMessageType } from '@quiz-lib/core';

log('info', `Configured with NUM_QNS=${NUM_QNS}`);

const PORT = Number(process.env.PORT) || 8081;

const httpServer = createServer();
const io = new Server(httpServer);

// ToDo: implement players and allow connections to be transient
const players: { [k: string]: any } = {};

io.on('connection', (socket) => {
  const playerId = generateUniqueId('player');
  const player = {
    id: playerId,
  };

  players[playerId] = player;
  log('info', 'Player connected', playerId);

  socket.onAny((event, ...args) => {
    log('debug', `Received socket '${event}' event:`, playerId, args);
  });

  socket.on('error', (error) => {
    log('error', 'Socket.IO Error', playerId, error);
  });

  socket.on('message', async (message) => {
    await messageHandler(socket, player, message);
  });

  socket.on('disconnect', () => {
    log('info', 'Player disconnected', playerId);
    delete players[playerId];
  });

  socket.emit('message', {
    type: ServerMessageType.NEW_GAME,
    payload: {
      text: 'Do you want to play a quiz?',
    },
  });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  log('info', `Socket.IO server listening on port: ${PORT}`);
});
