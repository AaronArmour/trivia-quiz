import { Quiz } from '@quiz-lib/core';

export interface Player {
  id: string;
  quiz?: Quiz;
}
