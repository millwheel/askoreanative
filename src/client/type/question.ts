export type QuestionStatus = "OPEN" | "ANSWERED" | "CLOSED";

export type QuestionSummaryResponse = {
  id: number;
  authorDisplayName: string;
  authorAvatarUrl: string | null;
  title: string;
  excerpt: string;
  category: string;
  viewCount: number;
  createdAt: string;
};

export type QuestionDetailResponse = {
  id: number;
  authorDisplayName: string;
  authorAvatarUrl: string | null;
  title: string;
  description: string;
  category: string;
  viewCount: number;
  status: QuestionStatus;
  createdAt: string;
  updatedAt: string;
};
