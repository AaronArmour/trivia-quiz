import { prompt } from 'prompts';

import { QuestionPayload } from '@quiz-lib/core';

export async function getUserAnswer(question: QuestionPayload) {
  return (
    await prompt(
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
    )
  ).answer;
}

export async function getYesNoResponse(text: string) {
  return (
    await prompt(
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
    )
  ).response;
}
