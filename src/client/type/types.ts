export type UUID = string;
export type Timestamp = string;

export interface MeResponse {
  id: string;
  email: string;
  displayName: string;
  role: string;
  avatarUrl: string;
}

export interface UserProfileResponse {
  id: UUID;
  email: string;
  name: string;
  displayName: string;
  role: string;
  avatarUrl: string;
}

export type QuestionType = "FREE" | "EXPRESS" | "EXPERT";

export type QuestionStatus = "OPEN" | "ANSWERED" | "CLOSED";

export interface QuestionSummary {
  id: number;
  title: string;
  excerpt: string;
  authorName: string;
  authorAvatar: string;
  createdAt: string;
  category: string;
  viewCount: number;
  replies: number;
}

export interface QuestionDetail {
  id: UUID;
  asker_id: UUID;
  title: string;
  body: string;
  type: QuestionType;
  status: QuestionStatus;
  accepted_answer_id: UUID | null;
  created_at: Timestamp;
}

export interface Answer {
  id: UUID;
  question_id: UUID;
  author_id: UUID;
  body: string;
  is_accepted: boolean;
  created_at: Timestamp;
}
