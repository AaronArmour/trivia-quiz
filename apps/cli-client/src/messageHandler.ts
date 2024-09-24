import { Socket } from 'socket.io-client';
import kleur from 'kleur';

import { getUserAnswer, getYesNoResponse } from './userInput';

export async function messageHandler(socket: Socket, message: any) {
  switch (message.mType) {
    case 'text':
      console.log(message.text);
      break;
    case 'question':
      const userAnswer = await getUserAnswer(message);

      socket.emit('message', {
        mType: 'answer',
        id: message.id,
        answer: userAnswer,
      });
      break;
    case 'grading':
      if (message.correct) {
        console.log(kleur.green('Correct!'));
      } else {
        console.log(kleur.red('Incorrect!'));
        console.log(kleur.red(`Correct answer: ${message.correctAnswer}`));
      }
      console.log();
      break;
    case 'score':
      // End of the quiz, display the final score and prompt to play again
      console.log(
        `You got ${message.correct} out of ${message.total} correct!`,
      );
      if (
        (await getYesNoResponse('Do you want to play another quiz?')) === 'y'
      ) {
        socket.emit('message', { mType: 'start' });
      } else {
        socket.disconnect();
      }
      break;
    case 'new-game':
      if ((await getYesNoResponse(message.text)) === 'y') {
        socket.emit('message', { mType: 'start' });
      } else {
        socket.disconnect();
      }
      break;
    default:
      console.log(`Unrecognized message type. Received response: ${message}`);
  }
}
