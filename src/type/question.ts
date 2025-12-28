import { TopicQueryDto, TopicSummaryResponse } from "@/type/topic";

export type QuestionStatus = "OPEN" | "ANSWERED" | "CLOSED";

export type QuestionSummaryResponse = {
  id: number;
  authorDisplayName: string;
  authorAvatarUrl: string | null;
  title: string;
  excerpt: string;
  viewCount: number;
  answerCount: number;
  createdAt: string;
  topics: TopicSummaryResponse[];
};

export type QuestionCreateRequest = {
  title: string;
  content?: string | null;
  status?: QuestionStatus;
  topicIds?: number[] | null;
};

export type QuestionCreateResponse = {
  questionId?: number;
};

export type QuestionDetailResponse = {
  id: number;
  authorDisplayName: string;
  authorAvatarUrl: string | null;
  title: string;
  content: string;
  viewCount: number;
  status: QuestionStatus;
  createdAt: string;
  updatedAt: string;
  topics: TopicSummaryResponse[];
};

export type QuestionIdTopicQueryDto = {
  question_id: number;
  topic: TopicQueryDto | TopicQueryDto[] | null;
};
