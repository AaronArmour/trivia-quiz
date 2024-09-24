import { Quiz } from '@quiz-lib/core';
import { Socket } from 'socket.io';

import { NUM_QNS } from './constants';
import { sendQuestionToPlayer } from './sendQuestion';
import { Player } from './types';
import { log } from './logger';

export async function messageHandler(
  socket: Socket,
  message: any,
  player: Player,
) {
  log('verbose', `Received message of type: ${message.mType}`, player.id);

  switch (message.mType) {
    case 'answer':
      if (!player.quiz) {
        log('warn', 'Player has no quiz object set', player.id);
        return;
      }

      log('verbose', 'Grading answer', player.id);
      const grading = player.quiz.gradeAnswer(message);
      log('debug', `Graded answer as follows:`, player.id, grading);
      socket.emit('message', {
        mType: 'grading',
        ...grading,
      });

      if (player.quiz.numQuestionsLeft() > 0) {
        log('verbose', 'Sending next question', player.id);
        const question = player.quiz.getQuestion();
        log('debug', `Next question is:`, player.id, question);
        sendQuestionToPlayer(socket, question);
      } else {
        log('info', 'Quiz complete', player.id);
        const score = player.quiz.getScore();
        log('debug', `Player score is:`, player.id, score);
        socket.emit('message', {
          mType: 'score',
          ...score,
        });
      }
      break;
    case 'start':
      log('verbose', 'Creating new quiz', player.id);
      player.quiz = new Quiz(socket, NUM_QNS);
      await player.quiz.initQuestions();
      log('debug', 'Quiz questions initialised', player.id);
      log('info', 'Start quiz', player.id);

      const question = player.quiz.getQuestion();
      log('verbose', 'Sending first question', player.id);
      log('debug', `First question is:`, player.id, question);
      sendQuestionToPlayer(socket, question);
      break;
    default:
      log('warn', `Unrecognised message type: ${message}`, player.id);
  }
}
