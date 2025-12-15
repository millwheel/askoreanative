"use client";

import React, { useMemo, useState } from "react";
import { CATEGORIES } from "@/client/data/filter";
import { QUESTIONS } from "@/client/data/question";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
          <Button asChild className="rounded-full">
            <Link href="/questions/new">Ask new question</Link>
          </Button>
        </div>
      </section>

      {/* 필터 영역 */}
      <section className="border-b border-border-light">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex-1">
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search questions about Korea..."
                className="rounded-full"
              />
            </div>
            <Button className="rounded-full">🔍</Button>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full rounded-full md:w-52">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* 질문 리스트 */}
      <section className="mx-auto max-w-5xl px-4 py-8">
        {filteredQuestions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-gray-500">
              No questions found. Try a different keyword or category.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((q) => (
              <Card key={q.id} className="transition hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">{q.title}</CardTitle>
                    <Badge variant="secondary" className="whitespace-nowrap">
                      {q.category}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-gray-600">{q.excerpt}</p>
                </CardContent>

                <CardFooter className="flex flex-wrap items-center justify-between gap-3">
                  {/* 작성자 */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={q.authorAvatar} alt={q.authorName} />
                      <AvatarFallback>{q.authorName[0]}</AvatarFallback>
                    </Avatar>
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
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Eye className="h-3.5 w-3.5" />
                      <span>{q.viewCount}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>{q.replies}</span>
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
