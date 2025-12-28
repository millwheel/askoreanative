export type AnswerCreateRequest = {
  title: string;
  content: string;
  questionId: number;
};

export type AnswerCreateResponse = {
  answerId?: number;
};

export type AnswerResponse = {
  id: number;
  questionId: number;
  authorDisplayName: string;
  authorAvatarUrl: string | null;
  title: string;
  content: string;
  upvoteCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AnswerQueryDto = {
  id: number;
  question_id: number;
  author_id: string;
  title: string;
  content: string;
  upvote_count: number;
  created_at: string;
  updated_at: string;
};

export type AnswerCountQueryDto = {
  question_id: number;
  answer_count: number;
};
