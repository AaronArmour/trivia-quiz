import { Socket } from 'socket.io';

import { Question } from '@quiz-lib/core';

export function sendQuestionToPlayer(socket: Socket, question?: Question) {
  if (question) {
    socket.emit('message', {
      mType: 'question',
      id: question.id,
      question: question.question,
      answers: question.answers,
    });
  } else {
    socket.emit('message', {
      mType: 'text',
      text: 'No more questions available',
    });
  }
}
