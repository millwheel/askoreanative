"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import toast from "react-hot-toast";
import { apiPost } from "@/lib/axios/api";
import { AnswerCreateRequest, AnswerCreateResponse } from "@/type/answer";

export default function NewAnswerPage() {
  const router = useRouter();
  const params = useParams<{ questionId: string }>();

  const questionId = Number(params.questionId);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!Number.isFinite(questionId) || questionId <= 0) {
      toast.error("Invalid questionId.");
      router.replace("/questions");
      return;
    }

    const payload: AnswerCreateRequest = {
      questionId,
      title,
      content,
    };

    setSubmitting(true);
    try {
      const { data, error } = await apiPost<AnswerCreateResponse>(
        "/answers",
        payload,
      );

      if (error) {
        toast.error(error.message ?? "Failed to create answer.");
        return;
      }

      if (!data?.answerId) {
        toast.error("Invalid server response.");
        router.replace(`/questions/${questionId}`);
        return;
      }

      router.replace(`/questions/${questionId}`);
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
            답변 작성하기
          </h1>
          <p className="text-sm text-gray-500">
            상세한 답변으로 질문자를 도와주세요
          </p>
        </div>
      </section>

      {/* 본문 */}
      <section className="mx-auto max-w-4xl px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 내용 */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">
                  내용 <span className="text-primary">*</span>
                </label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="답변 내용을 질문자의 언어로 여기에 작성해주세요. 질문자가 고마워할 것입니다!"
                  className="rounded-xl min-h-[340px] resize-none"
                />
              </div>

              {/* 제목 */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">
                  제목 <span className="text-primary">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="답변 내용을 한 문장으로 요약해주세요"
                  className="rounded-xl"
                  maxLength={100}
                />
              </div>

              {/* 버튼 */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button
                  type="submit"
                  className="rounded-full"
                  disabled={submitting}
                >
                  {submitting ? "Posting..." : "Post Answer"}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-full"
                  onClick={() => router.push(`/questions/${questionId}`)}
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
