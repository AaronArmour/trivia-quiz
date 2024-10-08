import { Player, Question, ServerMessageType } from '@quiz-lib/core';

export function sendQuestionToPlayer(player: Player, question?: Question) {
  if (question) {
    player.emit({
      type: ServerMessageType.QUESTION,
      payload: {
        id: question.id,
        question: question.question,
        answers: question.answers,
      },
    });
  } else {
    player.emit({
      type: ServerMessageType.TEXT,
      payload: {
        text: 'No more questions available',
      },
    });
  }
}
