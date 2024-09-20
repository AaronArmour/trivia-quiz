import { WebSocket } from 'ws';

import { Question } from '@quiz-lib/core';

export function sendQuestionToPlayer(ws: WebSocket, question?: Question) {
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
