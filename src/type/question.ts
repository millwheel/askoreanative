import { TopicQueryDto, TopicSummaryResponse } from "@/type/topic";

export type QuestionStatus = "OPEN" | "ANSWERED" | "CLOSED";

export type QuestionSummaryResponse = {
  id: number;
  authorDisplayName: string;
  authorAvatarUrl: string | null;
  title: string;
  excerpt: string;
  viewCount: number;
  createdAt: string;
  topics: TopicSummaryResponse[];
};

export type QuestionCreateRequest = {
  title: string;
  body?: string | null;
  status?: QuestionStatus;
  topicIds?: number[] | null;
};

export type QuestionDetailResponse = {
  id: number;
  authorDisplayName: string;
  authorAvatarUrl: string | null;
  title: string;
  body: string;
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
