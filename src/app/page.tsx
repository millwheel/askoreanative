import Link from "next/link";
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
import React from "react";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero 영역 */}
      <section className="bg-primary text-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center px-4 py-16 text-center sm:py-20">
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
        <div className="mx-auto max-w-5xl px-4">
          <div className="rounded-2xl bg-white p-4 shadow-md space-y-3 md:flex md:items-center md:gap-3 md:space-y-0">
            {/* 검색 영역 */}
            <div className="flex flex-1 items-center gap-2">
              <Input
                type="text"
                placeholder="Search questions about Korea..."
                className="flex-1 rounded-full"
              />
              <Button className="rounded-full px-4">🔍</Button>
            </div>

            {/* 카테고리 */}
            <Select>
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

      {/* Recent Questions */}
      <section className="mx-auto mt-10 max-w-5xl px-4 pb-16">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-foreground">
            Recent Questions
          </h2>
          <Button asChild className="rounded-full">
            <Link href="/questions/new">Ask new question</Link>
          </Button>
        </div>

        <div className="space-y-4">
          {QUESTIONS.map((q) => (
            <Card key={q.id} className="transition hover:shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">{q.title}</CardTitle>
                  <Badge variant="secondary">{q.category}</Badge>
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
                    <span className="text-sm font-semibold text-foreground">
                      {q.authorName}
                    </span>
                    <span className="text-xs text-gray-500">{q.createdAt}</span>
                  </div>
                </div>

                {/* 통계 */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span>👁</span>
                    <span>{q.viewCount}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span>💬</span>
                    <span>{q.replies}</span>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
