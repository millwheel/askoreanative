"use client";

import { useEffect, useMemo, useState } from "react";
import { QuestionSummaryResponse } from "@/type/question";

type Params = {
  initialOffset?: number;
};

export function useQuestions({ initialOffset = 0 }: Params = {}) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionSummaryResponse[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErrorMessage(null);

      const res = await fetch(`/api/questions?offset=${initialOffset}`, {
        method: "GET",
      });

      if (!res.ok) {
        setQuestions([]);
        setErrorMessage(`Failed to load questions (${res.status})`);
        setLoading(false);
        return;
      }

      const data = (await res.json()) as QuestionSummaryResponse[];
      setQuestions(data);
      setLoading(false);
    })();
  }, [initialOffset]);

  const filteredQuestions = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return questions;

    return questions.filter(
      (q) =>
        q.title.toLowerCase().includes(keyword) ||
        q.excerpt.toLowerCase().includes(keyword),
    );
  }, [questions, search]);

  return {
    search,
    setSearch,
    loading,
    errorMessage,
    questions,
    filteredQuestions,
  };
}
