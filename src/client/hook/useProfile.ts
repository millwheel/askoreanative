"use client";

import useSWR from "swr";
import { UserProfileResponse } from "@/client/type/types";

const fetcher = async (url: string): Promise<UserProfileResponse | null> => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error(`Failed: ${res.status}`);
  return res.json();
};

export function useProfile() {
  const { data, error, isLoading, mutate } = useSWR<UserProfileResponse | null>(
    "/api/profile",
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  );

  return { profile: data, loading: isLoading, error, mutate };
}
