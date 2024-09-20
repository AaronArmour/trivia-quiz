import { WebSocketServer } from 'ws';

import { clamp, generateUniqueId } from '@quiz-lib/utils';
import { Question, Quiz } from '@quiz-lib/core';

const PORT = Number(process.env.PORT) || 8081;
const MAX_QNS = 20; // Limit the number of questions to a maximum of 20
const NUM_QNS = clamp(Number(process.env.NUM_QNS) || 10, 1, MAX_QNS); // ... and a minimum of 1

// NB: host arg required to bind to all interfaces to allow Postman testing
const wss = new WebSocketServer({ port: PORT, host: '0.0.0.0' });
console.log(`WebSocket server listening on port: ${PORT}`);

// ToDo: implement players and allow connections to be transient
const players: { [k: string]: any } = {};

wss.on('connection', async (ws) => {
  function sendQuestionToPlayer(question: Question | undefined) {
    if (question) {
      ws.send(
        JSON.stringify({
          mType: 'question',
          id: question.id,
          question: question.question,
          answers: question.answers,
        }),
      );
    } else {
      ws.send(
        JSON.stringify({
          mType: 'text',
          text: 'No more questions available',
        }),
      );
    }
  }

  const playerId = generateUniqueId('player');
  const player = {
    id: playerId,
    ws,
    send(message: string) {
      ws.send(message);
    },
  };

  players[playerId] = player;

  console.log(`Player connected: ${playerId}`);
  players[playerId] = player;

  ws.onerror = function (error) {
    console.error('WebSocket Error: ', error);
  };

  ws.send(
    JSON.stringify({ mType: 'new-game', text: 'Do you want to play a quiz?' }),
  );
  let quiz: Quiz;

  ws.on('message', async (message) => {
    console.log(`Received message from ${playerId}: ${message}`);
    const mObj = JSON.parse(message.toString('utf-8'));

    switch (mObj.mType) {
      case 'answer':
        const grading = quiz.gradeAnswer(mObj);
        ws.send(
          JSON.stringify({
            mType: 'grading',
            ...grading,
          }),
        );

        if (quiz.numQuestionsLeft() > 0) {
          const question = quiz.getQuestion();
          sendQuestionToPlayer(question);
        } else {
          const score = quiz.getScore();
          ws.send(
            JSON.stringify({
              mType: 'score',
              ...score,
            }),
          );
        }
        break;
      case 'start':
        quiz = new Quiz(ws, NUM_QNS);
        await quiz.initQuestions();

        const question = quiz.getQuestion();
        sendQuestionToPlayer(question);
        break;
      default:
        console.log(`Unrecognised message type. Received response: ${message}`);
    }
  });

  ws.on('close', () => {
    console.log(`Player disconnected: ${playerId}`);
    delete players[playerId];
  });
});
