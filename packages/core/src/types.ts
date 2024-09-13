export interface Question {
  id: string;
  question: string;
  answers: string[];
  correctAnswer: string;
  correctResponse: string;
};

export interface Answer {
  id: string;
  answer: string;
}

export interface QuestionGrading {
  id: string;
  correct: boolean;
  correctAnswer: string;
}

export interface Score {
  correct: number;
  total: number;
}