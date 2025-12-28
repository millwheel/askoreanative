export type AnswerCreateRequest = {
  title: string;
  content: string;
  questionId: number;
};

export type AnswerCreateResponse = {
  answerId?: number;
};
