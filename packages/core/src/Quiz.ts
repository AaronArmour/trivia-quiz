import axios from 'axios';

import { generateUniqueId, randomPermutation } from '@quiz-lib/utils';
import { Answer, Question, QuestionGrading, Score } from './types';
import { QuizPlayer } from './QuizPlayer';

interface IQuiz {
  initQuestions(): Promise<void>;
  getQuestion(): Question | undefined;
  gradeAnswer(answer: Answer): QuestionGrading | undefined;
  getScore(): Score;
  numQuestionsLeft(): number;
}

export class Quiz implements IQuiz {
  private id: string;
  private player: QuizPlayer;
  private numQuestions: number;
  private qs: Question[];
  private qIndex: number;
  private correctAnswers: number;

  constructor(player: QuizPlayer, numQuestions: number) {
    this.id = generateUniqueId('quiz');
    this.player = player;
    this.numQuestions = numQuestions;
    this.qs = [];
    this.qIndex = 0;
    this.correctAnswers = 0;
  }

  async initQuestions(): Promise<void> {
    // fetch questions from API
    this.qs = prepareQuestions(await getQuestions(this.numQuestions));
  }

  getQuestion(): Question | undefined {
    return this.qs[this.qIndex];
  }

  gradeAnswer(answer: Answer): QuestionGrading | undefined {
    if (answer.id !== this.qs[this.qIndex].id) return;

    const correct = answer.answer === this.qs[this.qIndex].correctResponse;
    if (correct) this.correctAnswers++;

    const grading = {
      id: this.qs[this.qIndex].id,
      correct,
      correctAnswer: this.qs[this.qIndex].correctAnswer,
    };

    this.qIndex++;

    return grading;
  }

  getScore(): Score {
    return {
      correct: this.correctAnswers,
      total: this.qs.length,
    };
  }

  numQuestionsLeft(): number {
    return this.qs.length - this.qIndex;
  }
}

// Eventually shift this to a separate file
async function getQuestions(numQuestions: number): Promise<any[]> {
  const res = await axios.get(
    `https://the-trivia-api.com/v2/questions?limit=${numQuestions}`,
  );

  return res.data.map((q: any) => {
    return {
      id: q.id,
      question: q.question.text,
      incorrectAnswers: q.incorrectAnswers,
      correctAnswer: q.correctAnswer,
    };
  });
}

function prepareQuestions(questions: any[]): Question[] {
  return questions.map((q) => {
    const choices = [q.correctAnswer, ...q.incorrectAnswers];
    const answers = new Array(choices.length);
    const perm = randomPermutation(choices.length);
    perm.forEach((p, i) => {
      answers[p] = choices[i];
    });

    return {
      id: q.id,
      question: q.question,
      answers: answers,
      correctAnswer: answers[perm[0]],
      correctResponse: `${perm[0]}`,
    };
  });
}
