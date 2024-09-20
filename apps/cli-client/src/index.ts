import { WebSocket } from 'ws';
import { prompt } from 'prompts';
import kleur from 'kleur';

import { Question } from '@quiz-lib/core';

const PORT = Number(process.env.PORT) || 8081;
const HOST = process.env.HOST || 'localhost';

const ws = new WebSocket(`ws://${HOST}:${PORT}`);

ws.on('message', async (message) => {
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
          answer: userAnswer.answer,
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
        (await getYesNoResponse('Do you want to play another quiz?'))
          .response === 'y'
      ) {
        ws.send(JSON.stringify({ mType: 'start' }));
      } else {
        ws.close();
      }
      break;
    case 'new-game':
      if ((await getYesNoResponse(mObj.text)).response === 'y') {
        ws.send(JSON.stringify({ mType: 'start' }));
      } else {
        ws.close();
      }
      break;
    default:
      console.log(`Unrecognised message type. Received response: ${message}`);
  }
});

ws.onerror = function (error) {
  console.error('WebSocket Error: ', error);
};

async function getUserAnswer(question: Question) {
  return await prompt(
    {
      type: 'select',
      name: 'answer',
      message: question.question,
      choices: question.answers.map((answer, i) => ({
        title: answer,
        value: i.toString(),
      })),
    },
    {
      onCancel: () => {
        process.exit(0);
      },
    },
  );
}

async function getYesNoResponse(text: string) {
  return await prompt(
    {
      type: 'select',
      name: 'response',
      message: text,
      choices: [
        { title: 'Yes', value: 'y' },
        { title: 'No', value: 'n' },
      ],
    },
    {
      onCancel: () => {
        process.exit(0);
      },
    },
  );
}
