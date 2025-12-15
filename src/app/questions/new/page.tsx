"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type QuestionType = "normal" | "express";

const CATEGORIES = [
  "Korea Travel Basics",
  "Food & Dining",
  "Cultural Insights",
  "Transportation",
  "Accommodation",
];

export default function NewQuestionPage() {
  const [questionType, setQuestionType] = useState<QuestionType>("normal");

  // UX 확인용 mock 기본 값
  const [title, setTitle] = useState(
    "Where should I stay in Seoul for my first 5-day trip?",
  );
  const [description, setDescription] = useState(
    `Hi! I'm visiting Korea for the first time in May.

- Trip length: 5 days
- Style: I love cafes, local food, and night views
- Budget: mid-range, not luxury but comfortable
- Prefer: areas that are safe and easy to move around by subway

I'd love some recommendations on which neighborhood to stay in (Hongdae, Myeongdong, Gangnam, etc.) and why.`,
  );
  const [category, setCategory] = useState(CATEGORIES[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 실제로는 API 호출 예정.
    // 지금은 UX 확인용이라 alert로만 처리.
    alert(
      `Mock submit 🚀\nType: ${questionType}\nTitle: ${title}\nCategory: ${category}`,
    );
  };

  return (
    <main className="min-h-screen">
      {/* 상단 헤더 */}
      <section className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 md:text-3xl">
              Ask a Question
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              한국 로컬에게 직접 물어보세요. 좋은 답변을 위해 여행 정보와 상황을
              구체적으로 작성해 주세요.
            </p>
          </div>
        </div>
      </section>

      {/* 본문 영역 */}
      <section className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
          {/* 왼쪽: 질문 작성 카드 */}
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit}>
                {/* 질문 타입 선택 */}
                <div className="mb-6">
                  <h2 className="mb-2 text-sm font-semibold text-gray-800">
                    질문 유형 선택
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* 일반 질문 */}
                    <button
                      type="button"
                      onClick={() => setQuestionType("normal")}
                      className={`rounded-2xl border p-4 text-left text-sm transition ${
                        questionType === "normal"
                          ? "border-primary bg-primary-light"
                          : "border-gray-200 bg-white hover:border-primary/60"
                      }`}
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-700">
                          Normal
                        </span>
                        <Badge
                          variant="selected"
                          className={`text-[10px] ${questionType === "normal" ? "" : "invisible"}`}
                        >
                          Selected
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-gray-600">
                        보통의 응답 속도, 무료 또는 기본 크레딧으로 답변을 받을
                        수 있어요.
                      </p>
                    </button>

                    {/* 익스프레스 질문 */}
                    <button
                      type="button"
                      onClick={() => setQuestionType("express")}
                      className={`rounded-2xl border p-4 text-left text-sm transition ${
                        questionType === "express"
                          ? "border-primary bg-primary-light"
                          : "border-gray-200 bg-white hover:border-primary/60"
                      }`}
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-700">
                          EXPRESS
                        </span>
                        <Badge
                          variant="selected"
                          className={`text-[10px] ${questionType === "express" ? "" : "invisible"}`}
                        >
                          Selected
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-gray-600">
                        더 빠른 응답을 기대할 수 있고, 상단에 우선 노출돼요.
                        (향후 유료/크레딧 기능 연결 예정)
                      </p>
                    </button>
                  </div>
                </div>

                {/* 제목 */}
                <div className="mb-4">
                  <label className="mb-1 block text-sm font-semibold text-gray-800">
                    Title <span className="text-primary">*</span>
                  </label>
                  <Input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What would you like to ask about Korea?"
                    className="rounded-xl"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    예: &quot;5월 첫 방문인데, 서울에서 숙소를 어디에 잡는 게
                    좋을까요?&quot;
                  </p>
                </div>

                {/* 카테고리 */}
                <div className="mb-4">
                  <label className="mb-1 block text-sm font-semibold text-gray-800">
                    Category <span className="text-primary">*</span>
                  </label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full rounded-xl">
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

                {/* 상세 내용 */}
                <div className="mb-4">
                  <label className="mb-1 block text-sm font-semibold text-gray-800">
                    Details (optional)
                  </label>
                  <Textarea
                    rows={8}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add details like travel dates, budget, preferences, and anything else locals should know."
                    className="rounded-xl"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    구체적으로 쓸수록, 더 좋은 답변을 받을 가능성이 높아요. 여행
                    날짜, 동행 인원, 예산, 선호 스타일 등을 적어주세요.
                  </p>
                </div>

                {/* 사진 업로드 (UX용, 동작 X) */}
                <div className="mb-6">
                  <label className="mb-1 block text-sm font-semibold text-gray-800">
                    Photos (optional)
                  </label>
                  <div className="flex flex-col items-start gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-xs text-gray-500">
                    <p>
                      여행 일정 캡처, 숙소 후보 스크린샷 등 이미지를 첨부할 수
                      있어요.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                    >
                      Upload Image (Mock)
                    </Button>
                    <span className="text-[11px] text-gray-400">
                      * 현재는 UX 데모용으로 실제 업로드는 되지 않습니다.
                    </span>
                  </div>
                </div>

                {/* 버튼 영역 */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Button type="submit" className="rounded-full">
                    Post Question (Mock)
                  </Button>
                  <Link
                    href="/questions"
                    className="text-gray-500 hover:text-gray-700 cursor-pointer"
                  >
                    Cancel and go to questions
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* 오른쪽: 요약 & 안내 카드 */}
          <aside className="space-y-4">
            <Card>
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-gray-900">
                  Preview & Info
                </h3>
                <p className="mt-2 text-xs text-gray-600">
                  지금은 UX만 확인하는 단계라, 실제로 저장되지는 않고 아래와
                  같이 미리보기만 해요.
                </p>

                <div className="mt-4 rounded-xl p-3 text-xs">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {questionType === "normal"
                        ? "일반 질문"
                        : "익스프레스 질문"}
                    </Badge>
                    <span className="text-[10px] text-gray-500">
                      Category: {category}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900 line-clamp-2">
                    {title || "Your question title will appear here."}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-600 line-clamp-3 whitespace-pre-line">
                    {description ||
                      "Question details preview will appear here."}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-xs text-gray-800">
                <h4 className="mb-1 text-sm font-semibold text-gray-900">
                  일반 vs 익스프레스, 어떻게 쓸까?
                </h4>
                <ul className="list-disc space-y-1 pl-4">
                  <li>
                    <strong>일반 질문</strong>: 기본 노출, 보통 응답 속도, 무료
                    또는 낮은 크레딧.
                  </li>
                  <li>
                    <strong>익스프레스 질문</strong>: 상단 우선 노출, 빠른 응답
                    기대, 향후 유료 모델 연동 예정.
                  </li>
                </ul>
                <p className="mt-2 text-[11px] text-gray-600">
                  나중에는 여기서 예상 응답 시간, 필요한 크레딧, 환불 정책 등을
                  안내하면 좋아 보임.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </main>
  );
}
