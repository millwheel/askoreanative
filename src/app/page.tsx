"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import React from "react";
import { useRouter } from "next/navigation";
import { useQuestions } from "@/client/hook/useQuestions";
import { QuestionSearchBar } from "@/client/components/question/questionSearchBar";
import { ErrorBanner } from "@/client/components/errorBanner";
import { QuestionSummaryList } from "@/client/components/question/questionSummaryList";
import { QuestionSummaryLoading } from "@/client/components/question/questionSummaryLoading";
import { useMe } from "@/client/hook/useMe";

export default function HomePage() {
  const router = useRouter();
  const { search, setSearch, loading, errorMessage, filteredQuestions } =
    useQuestions({ initialOffset: 0 });
  const { user, loading: userLoading } = useMe();

  const handleAskClick = () => {
    if (!user) {
      router.push("/login");
      return;
    }
    router.push("/questions/new");
  };

  return (
    <main className="min-h-screen">
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
          <Button
            variant="secondary"
            className="mt-8 rounded-full"
            disabled={userLoading}
            onClick={handleAskClick}
          >
            Ask Your First Question
          </Button>
        </div>
      </section>

      <section className="-mt-7">
        <div className="mx-auto max-w-4xl px-4">
          <div className="space-y-3 rounded-2xl bg-white p-4 shadow-md md:flex md:items-center md:gap-3 md:space-y-0">
            <QuestionSearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search questions about Korea..."
            />
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-4xl px-4 pb-16">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-foreground">
            Recent Questions
          </h2>
          {!userLoading && user && (
            <Button asChild className="rounded-full">
              <Link href="/questions/new">Ask new question</Link>
            </Button>
          )}
        </div>

        {loading && <QuestionSummaryLoading />}
        {!loading && errorMessage && <ErrorBanner message={errorMessage} />}
        {!loading && !errorMessage && (
          <QuestionSummaryList questions={filteredQuestions.slice(0, 3)} />
        )}
      </section>
    </main>
  );
}
