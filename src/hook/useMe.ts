import useSWR from "swr";
import {getCurrentUser} from "@/supabase/auth";

export function useMe() {
    const { data, error, isLoading, mutate } = useSWR("me", getCurrentUser);

    return {
        user: data ?? null,
        loading: isLoading,
        error,
        refresh: mutate,
    };
}