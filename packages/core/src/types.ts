export interface Question {
  id: string;
  question: string;
  answers: string[];
  correctAnswer: string;
  correctResponse: string;
}

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

export enum ClientMessageType {
  ANSWER = 'ANSWER',
  START = 'START',
}

export enum ServerMessageType {
  NEW_GAME = 'NEW_GAME',
  QUESTION = 'QUESTION',
  GRADING = 'GRADING',
  SCORE = 'SCORE',
  TEXT = 'TEXT',
}

export interface AnswerMessage {
  type: ClientMessageType.ANSWER;
  payload: Answer;
}

export interface StartMessage {
  type: ClientMessageType.START;
  payload: {};
}

export type ClientMessage = AnswerMessage | StartMessage;

export interface NewGameMessage {
  type: ServerMessageType.NEW_GAME;
  payload: { text: string };
}

export interface QuestionMessage {
  type: ServerMessageType.QUESTION;
  payload: Question;
}

export interface GradingMessage {
  type: ServerMessageType.GRADING;
  payload: QuestionGrading;
}

export interface ScoreMessage {
  type: ServerMessageType.SCORE;
  payload: Score;
}

export interface TextMessage {
  type: ServerMessageType.TEXT;
  payload: { text: string };
}

export type ServerMessage =
  | NewGameMessage
  | QuestionMessage
  | GradingMessage
  | ScoreMessage
  | TextMessage;
