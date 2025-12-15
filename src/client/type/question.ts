import { Timestamp, UUID } from "@/client/type/user";

export type QuestionStatus = "OPEN" | "ANSWERED" | "CLOSED";

export interface QuestionSummaryResponse {
  id: number;
  authorDisplayName: string;
  authorAvatarUrl: string;
  title: string;
  excerpt: string;
  category: string;
  viewCount: number;
  replies: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionDetailResponse {
  id: number;
  authorDisplayName: string;
  authorAvatarUrl: string;
  title: string;
  description: string;
  category: string;
  viewCount: number;
  status: QuestionStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Answer {
  id: UUID;
  question_id: UUID;
  author_id: UUID;
  body: string;
  is_accepted: boolean;
  created_at: Timestamp;
}
