"use client";

import React, { useMemo, useState } from "react";
import AskButton from "@/components/askButton";
import { CATEGORIES } from "@/data/filter";

type Question = {
  id: number;
  title: string;
  excerpt: string;
  authorName: string;
  authorAvatar: string;
  createdAt: string;
  category: string;
  views: number;
  replies: number;
};

const QUESTIONS: Question[] = [
  {
    id: 1,
    title: "What are the best seasonal festivals in Seoul?",
    excerpt:
      "I'm planning to visit Seoul in spring and would love to experience some traditional festivals...",
    authorName: "Sarah Chen",
    authorAvatar:
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=80",
    createdAt: "2 hours ago",
    category: "Cultural Insights",
    views: 127,
    replies: 5,
  },
  {
    id: 2,
    title: "Is T-money card still the best option for public transport?",
    excerpt:
      "I'll be in Korea for 10 days and I'm wondering if I should buy a T-money card or use a different option...",
    authorName: "Lucas Meyer",
    authorAvatar:
      "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=80",
    createdAt: "5 hours ago",
    category: "Transportation",
    views: 89,
    replies: 3,
  },
  {
    id: 3,
    title: "Where can I find the best Korean BBQ in Hongdae?",
    excerpt:
      "I'm staying near Hongdae and would love some recommendations for authentic Korean BBQ restaurants...",
    authorName: "Emily Johnson",
    authorAvatar:
      "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=80",
    createdAt: "1 day ago",
    category: "Food & Dining",
    views: 214,
    replies: 8,
  },
  {
    id: 4,
    title: "Is it safe to travel alone in Seoul at night?",
    excerpt:
      "I'm a solo female traveler and I'm wondering about safety when going back to my hotel late...",
    authorName: "Anna Müller",
    authorAvatar:
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=80",
    createdAt: "2 days ago",
    category: "Safety",
    views: 301,
    replies: 12,
  },
];

export default function QuestionsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All Categories");

  const filteredQuestions = useMemo(() => {
    let result = [...QUESTIONS];

    if (category !== "All Categories") {
      result = result.filter((q) => q.category === category);
    }

    if (search.trim()) {
      const keyword = search.toLowerCase();
      result = result.filter(
        (q) =>
          q.title.toLowerCase().includes(keyword) ||
          q.excerpt.toLowerCase().includes(keyword),
      );
    }

    return result;
  }, [search, category]);

  return (
    <main className="min-h-screen">
      {/* 상단 타이틀 영역 */}
      <section className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 md:text-3xl">
              Browse Questions
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Find real questions from travelers and answers from local Korean
              experts.
            </p>
          </div>
          <AskButton />
        </div>
      </section>

      {/* 필터 영역 */}
      <section className="border-b border-border-light">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search questions about Korea..."
                className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-full border border-gray-200 px-4 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary md:w-52"
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* 질문 리스트 */}
      <section className="mx-auto max-w-5xl px-4 py-8">
        {filteredQuestions.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
            No questions found. Try a different keyword or category.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((q) => (
              <article
                key={q.id}
                className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h2 className="text-base font-semibold text-gray-900">
                    {q.title}
                  </h2>
                  <span className="whitespace-nowrap rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary-dark">
                    {q.category}
                  </span>
                </div>

                <p className="mb-4 text-sm text-gray-600">{q.excerpt}</p>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* 작성자 */}
                  <div className="flex items-center gap-3">
                    <img
                      src={q.authorAvatar}
                      alt={q.authorName}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">
                        {q.authorName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {q.createdAt}
                      </span>
                    </div>
                  </div>

                  {/* 통계 + 버튼 */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <span>👁</span>
                      <span>{q.views}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <span>💬</span>
                      <span>{q.replies}</span>
                    </div>
                    <button className="rounded-full border border-gray-200 px-4 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                      View Details
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
