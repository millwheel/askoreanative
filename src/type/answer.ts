export type AnswerCreateRequest = {
  title: string;
  content: string;
};

export type AnswerCreateResponse = {
  answerId?: number;
};
