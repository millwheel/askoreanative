"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useMe() {
  const { data, error, isLoading, mutate } = useSWR("/api/me", fetcher);

  return {
    user: data?.user ?? null,
    loading: isLoading,
    error,
    refresh: mutate,
  };
}
