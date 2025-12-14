"use client";

import useSWR from "swr";
import { MeResponse } from "@/client/type/types";

const fetcher = async (url: string): Promise<MeResponse | null> => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`Failed: ${res.status}`);
  return res.json();
};

export function useMe() {
  const { data, error, isLoading, mutate } = useSWR<MeResponse | null>(
    "/api/me",
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  );

  return {
    user: data,
    loading: isLoading,
    error,
    mutate,
  };
}

// 1. mutate 역할?
// 2. !!data?.id 의 의미??
