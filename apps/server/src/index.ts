import { createServer } from 'http';
import { Server } from 'socket.io';

import { NUM_QNS } from './constants';
import { messageHandler } from './messageHandler';
import { log } from './logger';
import { ServerMessage, ServerMessageType } from '@quiz-lib/core';

log('info', `Configured with NUM_QNS=${NUM_QNS}`);

const PORT = Number(process.env.PORT) || 8081;

const httpServer = createServer();
const io = new Server(httpServer);

// ToDo: implement players and allow connections to be transient
const players: { [k: string]: any } = {};

io.on('connection', (socket) => {
  const playerId = socket.handshake.auth.playerId;
  let player;

  log('info', 'Players object', undefined, players);
  if (players[playerId]) {
    log('info', 'Player reconnected', playerId);
    player = players[playerId];
    player.socket = socket;

    const clientOffset = socket.handshake.auth.msgOffset;
    if (clientOffset < player.msgCache.length) {
      log(
        'info',
        `Delivering ${player.msgCache.length - clientOffset} cached message(s)`,
        playerId,
      );

      player.msgCache
        .slice(clientOffset)
        .forEach((message: ServerMessage, index: number) => {
          log('debug', 'Resending cached message:', playerId, message);
          socket.emit('message', message, clientOffset + index + 1);
        });
    }
  } else {
    log('info', 'Player connected', playerId);
    player = {
      id: playerId,
      msgOffset: 0,
      msgCache: [],
      socket,
      emit(message: ServerMessage) {
        this.socket.emit('message', message, ++this.msgOffset);
        this.msgCache.push(message);
      },
      toJSON() {
        return {
          type: 'Player',
          id: this.id,
          ...(this.quiz && { quiz: this.quiz.toJSON() }),
        };
      },
    };
    players[playerId] = player;

    player.emit({
      type: ServerMessageType.NEW_GAME,
      payload: {
        text: 'Do you want to play a quiz?',
      },
    });
  }
  log('info', 'Players object is now', undefined, players);

  socket.onAny((event, ...args) => {
    log('debug', `Received socket '${event}' event:`, playerId, args);
  });

  socket.on('error', (error) => {
    log('error', 'Socket.IO Error', playerId, error);
  });

  socket.on('message', async (message) => {
    await messageHandler(player, message);
  });

  socket.on('disconnect', () => {
    log('info', 'Player disconnected', playerId);
  });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  log('info', `Socket.IO server listening on port: ${PORT}`);
});
