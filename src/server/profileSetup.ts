import type { SupabaseClient } from "@supabase/supabase-js";
import { generateRandomDisplayName } from "@/util/randomName";

type EnsureUserProfileParams = {
  supabase: SupabaseClient;
  userId: string;
};

export async function ensureUserProfile({
  supabase,
  userId,
}: EnsureUserProfileParams) {
  const { data: profile, error: selectError } = await supabase
    .from("user_profile")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (selectError) {
    return { ok: false as const, step: "select" as const, error: selectError };
  }

  if (profile) {
    return { ok: true as const, created: false as const };
  }

  const now = new Date().toISOString();
  const displayName = generateRandomDisplayName();

  const { error: insertError } = await supabase.from("user_profile").insert({
    id: userId,
    display_name: displayName,
    role: "QUESTIONER",
    created_at: now,
    updated_at: now,
  });

  if (insertError) {
    return { ok: false as const, step: "insert" as const, error: insertError };
  }

  return { ok: true as const, created: true as const };
}
