"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";

type AuthUser = { id: string; email?: string | null };

// 현재 /api/auth 가 반환하는 형태
type AuthApiResponse = { user: AuthUser | null };

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

async function ensureProfile(): Promise<void> {
  const res = await fetch("/api/profile/ensure", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? "ensure profile failed");
  }
}

export function useMe() {
  const {
    data,
    error: authError,
    isLoading: authLoading,
    mutate,
  } = useSWR<AuthApiResponse>("/api/auth", (url: string) =>
    fetchJson<AuthApiResponse>(url),
  );

  const auth = data?.user ?? null;

  // 로그인 후 profile ensure는 1회만
  const ensuredOnceRef = useRef(false);

  const [ensuringProfile, setEnsuringProfile] = useState(false);
  const [ensureProfileError, setEnsureProfileError] = useState<unknown>(null);

  const refresh = () => mutate();

  useEffect(() => {
    if (authLoading) return;

    // 비로그인: 리셋
    if (!auth) {
      ensuredOnceRef.current = false;
      setEnsuringProfile(false);
      setEnsureProfileError(null);
      return;
    }

    // 로그인: ensure는 1회만
    if (ensuredOnceRef.current) return;

    ensuredOnceRef.current = true;
    setEnsuringProfile(true);

    (async () => {
      try {
        await ensureProfile();
        await refresh();
      } catch (e) {
        setEnsureProfileError(e);
      } finally {
        setEnsuringProfile(false);
      }
    })();
  }, [auth, authLoading]);

  return {
    auth, // ← "user"보다 의미가 정확함
    loading: authLoading || ensuringProfile,
    error: authError ?? ensureProfileError,
    refresh,

    // 필요하면 유지
    authLoading,
    ensuringProfile,
  };
}
