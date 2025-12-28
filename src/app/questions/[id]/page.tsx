"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuestionDetailResponse } from "@/type/question";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiGet, apiPost } from "@/lib/axios/api";
import { useMe } from "@/client/hook/useMe";
import { AnswerResponse } from "@/type/answer";
import { formatDateTime } from "@/util/dateTime";
import { AnswerLoading } from "@/client/components/answer/answerLoading";
import { ThumbsUp } from "lucide-react";

export default function QuestionDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [questionLoading, setQuestionLoading] = useState(true);
  const [question, setquestion] = useState<QuestionDetailResponse | null>(null);
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswerResponse[]>([]);
  const [answersLoading, setAnswersLoading] = useState(false);
  const [answersError, setAnswersError] = useState<string | null>(null);
  const { user, loading: userLoading } = useMe();

  // 질문 상세 호출
  useEffect(() => {
    if (!id) return;

    (async () => {
      setQuestionLoading(true);
      setQuestionError(null);

      const { data, error, status } = await apiGet<QuestionDetailResponse>(
        `/questions/${id}`,
      );

      if (error || !data) {
        setQuestionError(
          `Failed to load question${status ? ` (${status})` : ""}`,
        );
        setquestion(null);
        setQuestionLoading(false);
        return;
      }

      setquestion(data);
      setQuestionLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    apiPost(`/questions/${id}/view`).catch(() => {
      // 조회수 실패는 UX에 영향 주지 않도록 조용히 무시
    });
  }, [id]);

  // 답변들 호출
  useEffect(() => {
    if (!question?.id) return;

    (async () => {
      setAnswersLoading(true);
      setAnswersError(null);
      setAnswers([]);

      const { data, error, status } = await apiGet<AnswerResponse[]>(
        `/answers?questionId=${question.id}`,
      );

      if (error || !data) {
        setAnswersError(
          `Failed to load answers${status ? ` (${status})` : ""}`,
        );
        setAnswers([]);
        setAnswersLoading(false);
        return;
      }

      setAnswers(data);
      setAnswersLoading(false);
    })();
  }, [question?.id]);

  const canRenderAnswers = !questionLoading && !questionError && !!question;
  return (
    <main className="min-h-screen">
      {/* ================= Header ================= */}
      <section className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-4xl flex-col gap-2 px-4 py-6">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold text-gray-900 md:text-3xl">
              Question
            </h1>
          </div>
        </div>
      </section>

      {/* ================= Question ================= */}
      <section className="mx-auto max-w-4xl px-4 py-8">
        <Card>
          <CardContent className="p-6">
            {/* 질문 로딩 */}
            {questionLoading && (
              <div className="space-y-3">
                <div className="h-7 w-3/4 rounded bg-gray-100" />
                <div className="h-4 w-2/3 rounded bg-gray-100" />
                <div className="h-28 w-full rounded bg-gray-100" />
              </div>
            )}

            {/* 질문 에러 */}
            {!questionLoading && questionError && (
              <div className="space-y-4">
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {questionError}
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

            {/* 질문 상세 */}
            {!questionLoading && !questionError && question && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold tracking-tight text-gray-900 md:text-3xl">
                  {question.title}
                </h2>

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

                {question.content?.trim() ? (
                  <div className="whitespace-pre-wrap text-sm leading-7 text-gray-900">
                    {question.content}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No content.</div>
                )}

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

      {/* ================= Answers ================= */}
      <section className="mx-auto max-w-4xl px-4 pb-12">
        {canRenderAnswers && question && (
          <div className="space-y-4">
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {answersLoading ? "Loading..." : `${answers.length} answer(s)`}
              </div>
            </div>

            {/* 답변 로딩 */}
            {answersLoading && <AnswerLoading />}

            {/* 답변 에러 */}
            {!answersLoading && answersError && (
              <div className="space-y-3">
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {answersError}
                </div>
                <Button
                  className="rounded-full"
                  onClick={() => router.refresh()}
                >
                  Retry
                </Button>
              </div>
            )}

            {/* 답변 없음 */}
            {!answersLoading && !answersError && answers.length === 0 && (
              <div className="rounded-2xl border bg-white p-6 text-sm text-gray-600">
                No answers yet. Be the first to answer!
              </div>
            )}

            {/* 답변 리스트 */}
            {!answersLoading && !answersError && answers.length > 0 && (
              <div className="space-y-4">
                {answers.map((a) => (
                  <Card key={a.id} className="rounded-2xl">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage
                              src={a.authorAvatarUrl ?? undefined}
                              alt={a.authorDisplayName}
                            />
                            <AvatarFallback>
                              {(a.authorDisplayName || "U")
                                .slice(0, 1)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {a.authorDisplayName || "Unknown"}
                            </div>
                            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                              <span>{formatDateTime(a.createdAt)}</span>
                              {a.updatedAt && a.updatedAt !== a.createdAt && (
                                <>
                                  <span>·</span>
                                  <span>
                                    Updated {formatDateTime(a.updatedAt)}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1 rounded-full px-3 py-1 text-xs cursor-pointer"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                          {a.upvoteCount}
                        </Badge>
                      </div>

                      {a.title?.trim() && (
                        <div className="mt-4 text-base font-semibold text-gray-900">
                          {a.title}
                        </div>
                      )}

                      {a.content?.trim() ? (
                        <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-900">
                          {a.content}
                        </div>
                      ) : (
                        <div className="mt-3 text-sm text-gray-500">
                          No content.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
