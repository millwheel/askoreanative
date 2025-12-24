"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useQuestions } from "@/client/hook/useQuestions";
import { QuestionSearchBar } from "@/client/components/question/questionSearchBar";
import { ErrorBanner } from "@/client/components/errorBanner";
import { QuestionList } from "@/client/components/question/questionList";
import { QuestionLoading } from "@/client/components/question/questionLoading";

export default function QuestionsPage() {
  const { search, setSearch, loading, errorMessage, filteredQuestions } =
    useQuestions({ initialOffset: 0 });

  return (
    <main className="min-h-screen">
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

      <section className="border-b border-border-light">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <QuestionSearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search questions about Korea..."
          />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-8">
        {loading && <QuestionLoading />}
        {!loading && errorMessage && <ErrorBanner message={errorMessage} />}
        {!loading && !errorMessage && (
          <QuestionList questions={filteredQuestions} />
        )}
      </section>
    </main>
  );
}
