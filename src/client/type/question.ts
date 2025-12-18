import { TopicSummaryResponse } from "@/client/type/topic";

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

export type QuestionDetailResponse = {
  id: number;
  authorDisplayName: string;
  authorAvatarUrl: string | null;
  title: string;
  description: string;
  viewCount: number;
  status: QuestionStatus;
  createdAt: string;
  updatedAt: string;
  topics: TopicSummaryResponse[];
};
