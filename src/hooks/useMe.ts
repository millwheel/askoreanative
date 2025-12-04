"use client";

import useSWR from "swr";
import { supabase } from "../../supabase/supabase";

export function useMe() {
    const { data, isLoading, error, mutate } = useSWR("me", fetchCurrentUser);

    return {
        user: data ?? null,
        loading: isLoading,
        error,
        refresh: mutate,
    };
}

const fetchCurrentUser = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
        return null;
    }

    const res = await fetch("/api/me", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        return null;
    }

    const json = await res.json();
    return json.user ?? null;
};