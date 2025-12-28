"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TopicResponse } from "@/type/topic";
import { QuestionCreateRequest, QuestionCreateResponse } from "@/type/question";
import toast from "react-hot-toast";
import { apiGet, apiPost } from "@/lib/axios/api";

export default function NewQuestionPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [topics, setTopics] = useState<TopicResponse[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<number[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // topic 목록 로드
  useEffect(() => {
    (async () => {
      setLoadingTopics(true);

      const { data, error } = await apiGet<TopicResponse[]>("/topics");

      if (error || !data) {
        console.error("Failed to load topics:", error?.message);
        setLoadingTopics(false);
        return;
      }

      const list: TopicResponse[] = Array.isArray(data) ? data : [];

      setTopics(list);
      setLoadingTopics(false);
    })();
  }, []);

  const toggleTopic = (id: number) => {
    setSelectedTopicIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // question 생성
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: QuestionCreateRequest = {
      title: title,
      content: content,
      topicIds: selectedTopicIds.length > 0 ? selectedTopicIds : null,
    };

    setSubmitting(true);
    try {
      const { data, error } = await apiPost<QuestionCreateResponse>(
        "/questions",
        payload,
      );

      if (error) {
        toast.error(error.message ?? "Failed to create question.");
        return;
      }

      if (!data?.questionId) {
        toast.error("Invalid server response.");
        router.replace("/questions");
        return;
      }

      router.replace(`/questions/${data.questionId}`);
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
                  Content
                </label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Add details of anything you're curious about."
                  className="rounded-xl min-h-[340px] resize-none"
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
