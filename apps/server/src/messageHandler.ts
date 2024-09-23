import { Quiz } from '@quiz-lib/core';
import WebSocket from 'ws';

import { NUM_QNS } from './constants';
import { sendQuestionToPlayer } from './sendQuestion';
import { Player } from './types';
import { log } from './logger';

export async function messageHandler(
  ws: WebSocket,
  message: WebSocket.RawData,
  player: Player,
) {
  log('verbose', `Received message: ${message}`, player.id);
  const mObj = JSON.parse(message.toString('utf-8'));

  switch (mObj.mType) {
    case 'answer':
      if (!player.quiz) {
        log('warn', 'Player has no quiz object set', player.id);
        return;
      }

      const grading = player.quiz.gradeAnswer(mObj);
      ws.send(
        JSON.stringify({
          mType: 'grading',
          ...grading,
        }),
      );

      if (player.quiz.numQuestionsLeft() > 0) {
        const question = player.quiz.getQuestion();
        sendQuestionToPlayer(ws, question);
      } else {
        const score = player.quiz.getScore();
        ws.send(
          JSON.stringify({
            mType: 'score',
            ...score,
          }),
        );
      }
      break;
    case 'start':
      player.quiz = new Quiz(ws, NUM_QNS);
      await player.quiz.initQuestions();
      log('info', 'Start quiz', player.id);

      const question = player.quiz.getQuestion();
      sendQuestionToPlayer(ws, question);
      break;
    default:
      log('warn', `Unrecognised message type: ${message}`, player.id);
  }
}
