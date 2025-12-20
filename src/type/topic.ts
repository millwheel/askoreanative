export type TopicResponse = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TopicSummaryResponse = {
  id: number;
  slug: string;
  name: string;
};

export type TopicQueryDto = {
  id: number;
  slug: string;
  name: string;
};
