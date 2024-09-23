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
  log('debug', `Received message: ${message}`, player.id);

  const mObj = JSON.parse(message.toString('utf-8'));
  log('verbose', `Received message of type: ${mObj.mType}`, player.id);

  switch (mObj.mType) {
    case 'answer':
      if (!player.quiz) {
        log('warn', 'Player has no quiz object set', player.id);
        return;
      }

      log('verbose', 'Grading answer', player.id);
      const grading = player.quiz.gradeAnswer(mObj);
      log('debug', `Graded answer as follows:`, player.id, grading);
      ws.send(
        JSON.stringify({
          mType: 'grading',
          ...grading,
        }),
      );

      if (player.quiz.numQuestionsLeft() > 0) {
        log('verbose', 'Sending next question', player.id);
        const question = player.quiz.getQuestion();
        log('debug', `Next question is:`, player.id, question);
        sendQuestionToPlayer(ws, question);
      } else {
        log('info', 'Quiz complete', player.id);
        const score = player.quiz.getScore();
        log('debug', `Player score is:`, player.id, score);
        ws.send(
          JSON.stringify({
            mType: 'score',
            ...score,
          }),
        );
      }
      break;
    case 'start':
      log('verbose', 'Creating new quiz', player.id);
      player.quiz = new Quiz(ws, NUM_QNS);
      await player.quiz.initQuestions();
      log('debug', 'Quiz questions initialised', player.id);
      log('info', 'Start quiz', player.id);

      const question = player.quiz.getQuestion();
      log('verbose', 'Sending first question', player.id);
      log('debug', `First question is:`, player.id, question);
      sendQuestionToPlayer(ws, question);
      break;
    default:
      log('warn', `Unrecognised message type: ${message}`, player.id);
  }
}
