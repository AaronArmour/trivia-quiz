import { WebSocket } from 'ws';
import { prompt } from 'prompts';
import kleur from 'kleur';

import { Question } from '@quiz-lib/core';

const PORT = Number(process.env.PORT) || 8081;

const ws = new WebSocket(`ws://localhost:${PORT}`);

ws.on('open', () => {
  ws.send('Hello from client!');
});

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
      // End of the quiz so display the final score and close the connection
      console.log(`You got ${mObj.correct} out of ${mObj.total} correct!`);
      ws.close();
      break;
    default:
      console.log(`Unrecognised message type. Received response: ${message}`);
  }
});

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
