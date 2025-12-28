"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiGet } from "@/lib/axios/api";
import { QuestionDetailResponse } from "@/type/question";

function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export type QuestionContextPanelProps = {
  questionId: number;
  defaultHeightPx?: number;
  minHeightPx?: number;
  maxHeightPx?: number;
  className?: string;
};

export function QuestionContextPanel({
  questionId,
  defaultHeightPx = 220,
  minHeightPx = 160,
  maxHeightPx = 520,
  className,
}: QuestionContextPanelProps) {
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState<QuestionDetailResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const contentText = useMemo(
    () => (question?.content ?? "").trim(),
    [question],
  );

  useEffect(() => {
    if (!Number.isFinite(questionId) || questionId <= 0) return;

    (async () => {
      setLoading(true);
      setErrorMessage(null);

      const { data, error, status } = await apiGet<QuestionDetailResponse>(
        `/questions/${questionId}`,
      );

      if (error || !data) {
        setQuestion(null);
        setErrorMessage(
          `Failed to load question${status ? ` (${status})` : ""}`,
        );
        setLoading(false);
        return;
      }

      setQuestion(data);
      setLoading(false);
    })();
  }, [questionId]);

  return (
    <Card className={className}>
      <CardContent className="p-5 md:p-6">
        {/* 로딩 */}
        {loading && (
          <div className="space-y-3">
            <div className="h-6 w-2/3 rounded bg-gray-100" />
            <div className="h-3 w-1/2 rounded bg-gray-100" />
            <div className="h-24 w-full rounded bg-gray-100" />
          </div>
        )}

        {/* 에러 */}
        {!loading && errorMessage && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        )}

        {/* 데이터 */}
        {!loading && !errorMessage && question && (
          <div className="space-y-4">
            {/* 제목 (상세페이지보다 한 단계 작은 톤) */}
            <div className="text-lg font-semibold leading-snug text-gray-900 md:text-xl">
              {question.title}
            </div>

            {/* 메타 */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span>view {question.viewCount}</span>
              <span>·</span>
              <span>{formatDateTime(question.createdAt)}</span>
              {question.updatedAt && (
                <>
                  <span>·</span>
                  <span>updated {formatDateTime(question.updatedAt)}</span>
                </>
              )}
            </div>

            {/* 작성자 */}
            <div className="flex items-center gap-2.5">
              <Avatar className="h-7 w-7">
                <AvatarImage
                  src={question.authorAvatarUrl ?? undefined}
                  alt={question.authorDisplayName}
                />
                <AvatarFallback className="text-[10px]">
                  {(question.authorDisplayName || "U")
                    .slice(0, 1)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-xs font-medium text-gray-800">
                {question.authorDisplayName || "Unknown"}
              </div>
            </div>

            {/* 토픽 */}
            {question.topics?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {question.topics.map((t) => (
                  <Badge
                    key={t.id}
                    variant="secondary"
                    className="rounded-full px-2 py-0.5 text-[11px]"
                  >
                    {t.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* 본문: 전체 렌더링 + 높이 제한 + 드래그 리사이즈 */}
            <div className="rounded-xl border bg-gray-50/60">
              <div
                className="resize-y overflow-auto p-4 text-sm leading-7 text-gray-900"
                style={{
                  height: defaultHeightPx,
                  minHeight: minHeightPx,
                  maxHeight: maxHeightPx,
                }}
              >
                {contentText ? (
                  <div className="whitespace-pre-wrap">{contentText}</div>
                ) : (
                  <div className="text-gray-500">No content.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
