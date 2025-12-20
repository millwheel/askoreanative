"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuestionDetailResponse, QuestionStatus } from "@/client/type/question";

function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function statusLabel(status: QuestionStatus) {
  switch (status) {
    case "OPEN":
      return "Open";
    case "ANSWERED":
      return "Answered";
    case "CLOSED":
      return "Closed";
    default:
      return status;
  }
}

export default function QuestionDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const id = params?.id;
  const questionId = useMemo(() => Number(id), [id]);

  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<QuestionDetailResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const res = await fetch(`/api/questions/${id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          const msg =
            typeof data?.error === "string"
              ? data.error
              : `Failed to load question (HTTP ${res.status})`;
          setErrorMessage(msg);
          setQuestion(null);
          return;
        }

        const data: QuestionDetailResponse = await res.json();
        setQuestion(data);
      } catch (e) {
        setErrorMessage("Network error. Please try again.");
        setQuestion(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <main className="min-h-screen">
      {/* 헤더 */}
      <section className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-4xl flex-col gap-2 px-4 py-6">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold text-gray-900 md:text-3xl">
              Question
            </h1>

            <Button
              type="button"
              variant="secondary"
              className="rounded-full"
              onClick={() => router.push("/questions")}
            >
              Back
            </Button>
          </div>

          {!Number.isNaN(questionId) && (
            <div className="text-xs text-gray-500">ID: {questionId}</div>
          )}
        </div>
      </section>

      {/* 본문 */}
      <section className="mx-auto max-w-4xl px-4 py-8">
        <Card>
          <CardContent className="p-6">
            {/* 로딩 */}
            {loading && (
              <div className="space-y-3">
                <div className="h-6 w-2/3 rounded bg-gray-100" />
                <div className="h-4 w-1/3 rounded bg-gray-100" />
                <div className="h-24 w-full rounded bg-gray-100" />
              </div>
            )}

            {/* 에러 */}
            {!loading && errorMessage && (
              <div className="space-y-4">
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {errorMessage}
                </div>
                <div className="flex gap-2">
                  <Button
                    className="rounded-full"
                    onClick={() => router.refresh()}
                  >
                    Retry
                  </Button>
                  <Button
                    variant="secondary"
                    className="rounded-full"
                    onClick={() => router.push("/questions")}
                  >
                    Go to list
                  </Button>
                </div>
              </div>
            )}

            {/* 데이터 */}
            {!loading && !errorMessage && question && (
              <div className="space-y-6">
                {/* 상단 메타 */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="rounded-full px-3 py-1">
                    {statusLabel(question.status)}
                  </Badge>

                  <span className="text-xs text-gray-500">
                    👁 {question.viewCount}
                  </span>

                  <span className="text-xs text-gray-500">
                    Posted: {formatDateTime(question.createdAt)}
                  </span>

                  {question.updatedAt && (
                    <span className="text-xs text-gray-500">
                      Updated: {formatDateTime(question.updatedAt)}
                    </span>
                  )}
                </div>

                {/* 제목 */}
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-gray-900 md:text-2xl">
                    {question.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium text-gray-800">
                      {question.authorDisplayName || "Unknown"}
                    </span>
                  </div>
                </div>

                {/* 토픽 */}
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-gray-800">
                    Topics
                  </div>

                  {question.topics.length === 0 ? (
                    <div className="text-sm text-gray-500">No topics.</div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {question.topics.map((t) => (
                        <Badge
                          key={t.id}
                          variant="secondary"
                          className="rounded-full px-3 py-1"
                        >
                          {t.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* 본문 */}
                <div className="space-y-2">
                  <div className="text-sm font-semibold text-gray-800">
                    Description
                  </div>

                  {question.description?.trim() ? (
                    <div className="whitespace-pre-wrap text-sm leading-6 text-gray-800">
                      {question.description}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No description.</div>
                  )}
                </div>

                {/* 하단 액션 */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <Button
                    className="rounded-full"
                    onClick={() => router.push("/questions")}
                  >
                    Back to Questions
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="rounded-full"
                    onClick={() => {
                      navigator.clipboard?.writeText?.(window.location.href);
                    }}
                  >
                    Copy link
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
