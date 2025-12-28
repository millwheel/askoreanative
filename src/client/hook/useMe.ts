"use client";

import useSWR from "swr";
import { MeResponse } from "@/type/user";

const fetcher = async (url: string): Promise<MeResponse | null> => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`Failed: ${res.status}`);
  return res.json();
};

export function useMe() {
  const { data, error, isLoading, mutate } = useSWR<MeResponse | null>(
    "/axios/me",
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  );

  return { user: data, loading: isLoading, error, mutate };
}
