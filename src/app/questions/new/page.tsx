"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TopicResponse } from "@/type/topic";
import { QuestionCreateRequest } from "@/type/question";
import toast from "react-hot-toast";

export default function NewQuestionPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const [topics, setTopics] = useState<TopicResponse[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<number[]>([]);

  const [loadingTopics, setLoadingTopics] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1) topic 목록 로드
  useEffect(() => {
    (async () => {
      setLoadingTopics(true);

      const res = await fetch("/api/topics", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        console.error("Failed to load topics:", res.status);
        setLoadingTopics(false);
        return;
      }

      const data = await res.json();

      const list: TopicResponse[] = Array.isArray(data)
        ? data
        : (data.topics ?? []);

      setTopics(list);
      setLoadingTopics(false);
    })();
  }, []);

  const toggleTopic = (id: number) => {
    setSelectedTopicIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const titleTrimmed = title.trim();
    const descriptionTrimmed = body.trim();

    if (!titleTrimmed) {
      toast.error("Please enter title");
      console.error("Title is required.");
      return;
    }

    if (!descriptionTrimmed) {
      toast.error("Please enter body");
      console.error("Body is required.");
      return;
    }

    const payload: QuestionCreateRequest = {
      title: titleTrimmed,
      description: descriptionTrimmed ? descriptionTrimmed : null,
      topicIds: selectedTopicIds.length > 0 ? selectedTopicIds : null,
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        toast.error("Failed to create question.");
        console.error("Failed to create question:", res.status);
        return;
      }

      const data = await res.json();

      const questionId: number | null =
        (typeof data?.questionId === "number" ? data.questionId : null) ??
        (typeof data?.question?.id === "number" ? data.question.id : null);

      router.replace(questionId ? `/questions/${questionId}` : "/questions");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen">
      {/* 헤더 */}
      <section className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-4xl flex-col gap-2 px-4 py-6">
          <h1 className="text-2xl font-semibold text-gray-900 md:text-3xl">
            Ask a Question
          </h1>
        </div>
      </section>

      {/* 본문 */}
      <section className="mx-auto max-w-4xl px-4 py-8">
        <Card>
          <CardContent className="p-6">
            {errorMessage && (
              <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 제목 */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">
                  Title <span className="text-primary">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What would you like to ask about Korea?"
                  className="rounded-xl"
                  maxLength={100}
                />
              </div>

              {/* 토픽(복수 선택) */}
              <div className="space-y-2">
                <div className="flex items-end justify-between gap-3">
                  <label className="block text-sm font-semibold text-gray-800">
                    Topics
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-8 rounded-full px-3 text-xs"
                    onClick={() => setSelectedTopicIds([])}
                  >
                    Clear
                  </Button>
                </div>

                {loadingTopics ? (
                  <div className="text-sm text-gray-500"></div>
                ) : topics.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    No topics available.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {topics.map((t) => {
                      const selected = selectedTopicIds.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => toggleTopic(t.id)}
                          className="outline-none"
                        >
                          <Badge
                            variant={selected ? "default" : "secondary"}
                            className="rounded-full px-3 py-1 cursor-pointer"
                          >
                            {t.name}
                          </Badge>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 상세 */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">
                  Description
                </label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Add details like travel dates, budget, preferences, and anything else."
                  className="rounded-xl"
                  rows={10}
                />
              </div>

              {/* 버튼 */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button
                  type="submit"
                  className="rounded-full"
                  disabled={submitting}
                >
                  {submitting ? "Posting..." : "Post Question"}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-full"
                  onClick={() => router.push("/questions")}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
