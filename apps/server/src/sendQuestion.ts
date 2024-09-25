import { Socket } from 'socket.io';

import { Question, ServerMessageType } from '@quiz-lib/core';

export function sendQuestionToPlayer(socket: Socket, question?: Question) {
  if (question) {
    socket.emit('message', {
      type: ServerMessageType.QUESTION,
      payload: {
        id: question.id,
        question: question.question,
        answers: question.answers,
      },
    });
  } else {
    socket.emit('message', {
      type: ServerMessageType.TEXT,
      payload: {
        text: 'No more questions available',
      },
    });
  }
}
