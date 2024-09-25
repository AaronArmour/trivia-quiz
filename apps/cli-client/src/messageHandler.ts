import { Socket } from 'socket.io-client';
import kleur from 'kleur';

import { getUserAnswer, getYesNoResponse } from './userInput';
import {
  assertNever,
  ClientMessageType,
  ServerMessage,
  ServerMessageType,
} from '@quiz-lib/core';

export async function messageHandler(socket: Socket, message: ServerMessage) {
  switch (message.type) {
    case ServerMessageType.TEXT:
      console.log(message.payload.text);
      break;

    case ServerMessageType.QUESTION:
      const userAnswer = await getUserAnswer(message.payload);

      socket.emit('message', {
        type: ClientMessageType.ANSWER,
        payload: {
          id: message.payload.id,
          answer: userAnswer,
        },
      });
      break;

    case ServerMessageType.GRADING:
      if (message.payload.correct) {
        console.log(kleur.green('Correct!'));
      } else {
        console.log(kleur.red('Incorrect!'));
        console.log(
          kleur.red(`Correct answer: ${message.payload.correctAnswer}`),
        );
      }
      console.log();
      break;

    case ServerMessageType.SCORE:
      // End of the quiz, display the final score and prompt to play again
      console.log(
        `You got ${message.payload.correct} out of ${message.payload.total} correct!`,
      );
      if (
        (await getYesNoResponse('Do you want to play another quiz?')) === 'y'
      ) {
        socket.emit('message', { type: ClientMessageType.START, payload: {} });
      } else {
        socket.disconnect();
      }
      break;

    case ServerMessageType.NEW_GAME:
      if ((await getYesNoResponse(message.payload.text)) === 'y') {
        socket.emit('message', { type: ClientMessageType.START, payload: {} });
      } else {
        socket.disconnect();
      }
      break;

    default:
      assertNever(message);
  }
}
