"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuestionDetailResponse } from "@/type/question";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiGet } from "@/lib/axios/api";
import { useMe } from "@/client/hook/useMe";

function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export default function QuestionDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<QuestionDetailResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user, loading: userLoading } = useMe();

  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(true);
      setErrorMessage(null);

      const { data, error, status } = await apiGet<QuestionDetailResponse>(
        `/questions/${id}`,
      );

      if (error || !data) {
        setErrorMessage(
          `Failed to load question${status ? ` (${status})` : ""}`,
        );
        setQuestion(null);
        setLoading(false);
        return;
      }

      setQuestion(data);
      setLoading(false);
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
          </div>
        </div>
      </section>

      {/* 본문 */}
      <section className="mx-auto max-w-4xl px-4 py-8">
        <Card>
          <CardContent className="p-6">
            {/* 로딩 */}
            {loading && (
              <div className="space-y-3">
                <div className="h-7 w-3/4 rounded bg-gray-100" />
                <div className="h-4 w-2/3 rounded bg-gray-100" />
                <div className="h-28 w-full rounded bg-gray-100" />
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
                {/* 1) 제목 */}
                <h2 className="text-2xl font-semibold tracking-tight text-gray-900 md:text-3xl">
                  {question.title}
                </h2>

                {/* 2) 조회수, 작성일자, 수정일자 */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span>view {question.viewCount}</span>
                  <span>·</span>
                  <span>Posted {formatDateTime(question.createdAt)}</span>
                  {question.updatedAt && (
                    <>
                      <span>·</span>
                      <span>Updated {formatDateTime(question.updatedAt)}</span>
                    </>
                  )}
                </div>

                {/* 3) 작성자 아바타, 작성자 display name */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={question.authorAvatarUrl ?? undefined}
                      alt={question.authorDisplayName}
                    />
                    <AvatarFallback>
                      {(question.authorDisplayName || "U")
                        .slice(0, 1)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="text-sm font-medium text-gray-900">
                    {question.authorDisplayName || "Unknown"}
                  </div>
                </div>

                {/* 4) 태그 */}
                {question.topics.length > 0 && (
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

                {/* 5) 본문 */}
                {question.content?.trim() ? (
                  <div className="whitespace-pre-wrap text-sm leading-7 text-gray-900">
                    {question.content}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No content.</div>
                )}

                {/* 6) 액션: 답변 작성 */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                  {!userLoading && user && (
                    <Button
                      className="rounded-full"
                      onClick={() =>
                        router.push(`/questions/${question.id}/answers/new`)
                      }
                    >
                      Write Answer
                    </Button>
                  )}

                  <Button
                    variant="secondary"
                    className="rounded-full"
                    onClick={() => router.push("/questions")}
                  >
                    Back to list
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
