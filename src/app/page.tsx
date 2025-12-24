"use client";

import Link from "next/link";
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
import React, { useEffect, useState } from "react";
import { QuestionSummaryResponse } from "@/type/question";
import { Eye, MessageCircle } from "lucide-react";

export default function HomePage() {
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
      {/* Hero 영역 */}
      <section className="bg-primary text-white">
        <div className="mx-auto flex max-w-4xl flex-col items-center px-4 py-16 text-center sm:py-20">
          <h1 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Welcome to Korea Travel Q&amp;A
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-primary-lighter sm:text-base">
            Connect with local Korean experts who speak your language. Get
            authentic travel advice, cultural insights, and practical tips for
            your journey.
          </p>
          <Button asChild variant="secondary" className="mt-8 rounded-full">
            <Link href="/questions/new">Ask Your First Question</Link>
          </Button>
        </div>
      </section>

      {/* 검색 바 */}
      <section className="-mt-7">
        <div className="mx-auto max-w-4xl px-4">
          <div className="rounded-2xl bg-white p-4 shadow-md space-y-3 md:flex md:items-center md:gap-3 md:space-y-0">
            {/* 검색 영역 */}
            <div className="flex flex-1 items-center gap-2">
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
        </div>
      </section>

      {/* Recent Questions */}
      <section className="mx-auto mt-10 max-w-4xl px-4 pb-16">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-foreground">
            Recent Questions
          </h2>
          <Button asChild className="rounded-full">
            <Link href="/questions/new">Ask new question</Link>
          </Button>
        </div>

        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="space-y-2">
                    <div className="h-4 w-3/4 rounded bg-gray-200" />
                    <div className="flex gap-2">
                      <div className="h-5 w-14 rounded-full bg-gray-200" />
                      <div className="h-5 w-20 rounded-full bg-gray-200" />
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 w-full rounded bg-gray-200" />
                    <div className="h-3 w-2/3 rounded bg-gray-200" />
                  </div>
                </CardContent>

                <CardFooter className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-200" />
                    <div className="h-3 w-24 rounded bg-gray-200" />
                  </div>
                  <div className="h-3 w-10 rounded bg-gray-200" />
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

        {!loading && !errorMessage && (
          <div className="space-y-4">
            {filteredQuestions.map((q) => (
              <Card key={q.id} className="transition hover:shadow-md">
                <CardHeader>
                  <div className="flex flex-col gap-2">
                    <CardTitle className="text-base">{q.title}</CardTitle>

                    <div className="flex flex-wrap gap-2">
                      {q.topics.map((topic) => (
                        <Badge
                          key={topic.id}
                          variant="secondary"
                          className="text-xs"
                        >
                          {topic.name}
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
                      <AvatarFallback>{q.authorDisplayName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground">
                        {q.authorDisplayName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {q.createdAt}
                      </span>
                    </div>
                  </div>

                  {/* 통계 */}
                  <div className="flex items-center gap-4">
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
