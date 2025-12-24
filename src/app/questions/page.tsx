"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Eye, MessageCircle } from "lucide-react";
import Link from "next/link";
import { QuestionSummaryResponse } from "@/type/question";

export default function QuestionsPage() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionSummaryResponse[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErrorMessage(null);

      const res = await fetch(`/api/questions?offset=0`, { method: "GET" });

      if (!res.ok) {
        setQuestions([]);
        setErrorMessage(`Failed to load questions (${res.status})`);
        setLoading(false);
        return;
      }

      const data = (await res.json()) as QuestionSummaryResponse[];

      setQuestions(data);
      setLoading(false);
    })();
  }, []);

  const keyword = search.trim().toLowerCase();
  const filteredQuestions = !keyword
    ? questions
    : questions.filter(
        (q) =>
          q.title.toLowerCase().includes(keyword) ||
          q.excerpt.toLowerCase().includes(keyword),
      );

  return (
    <main className="min-h-screen">
      {/* 상단 타이틀 영역 */}
      <section className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 md:text-3xl">
              Browse Questions
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Find real questions from travelers and answers from local Korean.
            </p>
          </div>
          <Button asChild className="rounded-full">
            <Link href="/questions/new">Ask new question</Link>
          </Button>
        </div>
      </section>

      {/* 검색 영역 */}
      <section className="border-b border-border-light">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions about Korea..."
              className="flex-1 rounded-full"
            />
            <Button className="rounded-full px-4">🔍</Button>
          </div>
        </div>
      </section>

      {/* 질문 리스트 */}
      <section className="mx-auto max-w-4xl px-4 py-8">
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="space-y-2">
                    <div className="h-4 w-2/3 rounded bg-gray-200" />
                    <div className="flex gap-2">
                      <div className="h-5 w-14 rounded-full bg-gray-200" />
                      <div className="h-5 w-20 rounded-full bg-gray-200" />
                      <div className="h-5 w-12 rounded-full bg-gray-200" />
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 w-full rounded bg-gray-200" />
                    <div className="h-3 w-5/6 rounded bg-gray-200" />
                  </div>
                </CardContent>

                <CardFooter className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-200" />
                    <div className="space-y-1">
                      <div className="h-3 w-24 rounded bg-gray-200" />
                      <div className="h-3 w-16 rounded bg-gray-200" />
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="h-3 w-10 rounded bg-gray-200" />
                    <div className="h-3 w-10 rounded bg-gray-200" />
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {!loading && errorMessage && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && filteredQuestions.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-sm text-gray-500">
              No questions found. Try a different keyword.
            </CardContent>
          </Card>
        )}

        {!loading && !errorMessage && filteredQuestions.length > 0 && (
          <div className="space-y-4">
            {filteredQuestions.map((q) => (
              <Card key={q.id} className="transition hover:shadow-md">
                <CardHeader>
                  <div className="flex flex-col gap-2">
                    <CardTitle className="text-base">{q.title}</CardTitle>

                    {/* topics */}
                    <div className="flex flex-wrap gap-2">
                      {q.topics?.map((t) => (
                        <Badge
                          key={`${q.id}-${t.slug}`}
                          variant="secondary"
                          className="whitespace-nowrap text-xs"
                        >
                          {t.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-gray-600">{q.excerpt}</p>
                </CardContent>

                <CardFooter className="flex flex-wrap items-center justify-between gap-3">
                  {/* 작성자 */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={q.authorAvatarUrl ?? undefined}
                        alt={q.authorDisplayName}
                      />
                      <AvatarFallback>
                        {q.authorDisplayName?.[0] ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">
                        {q.authorDisplayName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {q.createdAt}
                      </span>
                    </div>
                  </div>

                  {/* 통계 */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Eye className="h-3.5 w-3.5" />
                      <span>{q.viewCount}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MessageCircle className="h-3.5 w-3.5" />
                      {/*<span>{q.replies}</span>*/}
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
