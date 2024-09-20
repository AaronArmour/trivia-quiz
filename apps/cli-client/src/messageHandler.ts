import WebSocket from 'ws';
import kleur from 'kleur';

import { getUserAnswer, getYesNoResponse } from './userInput';

export async function messageHandler(
  ws: WebSocket,
  message: WebSocket.RawData,
) {
  const mObj = JSON.parse(message.toString('utf-8'));

  switch (mObj.mType) {
    case 'text':
      console.log(mObj.text);
      break;
    case 'question':
      const userAnswer = await getUserAnswer(mObj);

      ws.send(
        JSON.stringify({
          mType: 'answer',
          id: mObj.id,
          answer: userAnswer,
        }),
      );
      break;
    case 'grading':
      if (mObj.correct) {
        console.log(kleur.green('Correct!'));
      } else {
        console.log(kleur.red('Incorrect!'));
        console.log(kleur.red(`Correct answer: ${mObj.correctAnswer}`));
      }
      console.log();
      break;
    case 'score':
      // End of the quiz, display the final score and prompt to play again
      console.log(`You got ${mObj.correct} out of ${mObj.total} correct!`);
      if (
        (await getYesNoResponse('Do you want to play another quiz?')) === 'y'
      ) {
        ws.send(JSON.stringify({ mType: 'start' }));
      } else {
        ws.close();
      }
      break;
    case 'new-game':
      if ((await getYesNoResponse(mObj.text)) === 'y') {
        ws.send(JSON.stringify({ mType: 'start' }));
      } else {
        ws.close();
      }
      break;
    default:
      console.log(`Unrecognised message type. Received response: ${message}`);
  }
}
