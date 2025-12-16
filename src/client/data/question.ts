import { QuestionSummaryResponse } from "@/client/type/question";

export const QUESTIONS: QuestionSummaryResponse[] = [
  {
    id: 1,
    authorDisplayName: "Sarah Chen",
    authorAvatarUrl:
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=80",
    title: "What are the best seasonal festivals in Seoul?",
    excerpt:
      "I'm planning to visit Seoul in spring and would love to experience some traditional festivals...",
    category: "Cultural Insights",
    viewCount: 127,
    // replies: 5,
    createdAt: "2 hours ago",
  },
  {
    id: 2,
    authorDisplayName: "Lucas Meyer",
    authorAvatarUrl:
      "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=80",
    title: "Is T-money card still the best option for public transport?",
    excerpt:
      "I'll be in Korea for 10 days and I'm wondering if I should buy a T-money card or use a different option...",
    category: "Transportation",
    viewCount: 89,
    // replies: 3,
    createdAt: "5 hours ago",
  },
  {
    id: 3,
    authorDisplayName: "Emily Johnson",
    authorAvatarUrl:
      "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=80",
    title: "Where can I find the best Korean BBQ in Hongdae?",
    excerpt:
      "I'm staying near Hongdae and would love some recommendations for authentic Korean BBQ restaurants...",
    category: "Food & Dining",
    viewCount: 214,
    createdAt: "1 day ago",
    // replies: 8,
  },
  {
    id: 4,
    authorDisplayName: "Anna Müller",
    authorAvatarUrl:
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=80",
    title: "Is it safe to travel alone in Seoul at night?",
    excerpt:
      "I'm a solo female traveler and I'm wondering about safety when going back to my hotel late...",
    category: "Safety",
    viewCount: 301,
    createdAt: "2 days ago",
    // replies: 12,
  },
];
