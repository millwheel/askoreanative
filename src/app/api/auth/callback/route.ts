import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/server/supabase/config";
import { generateRandomDisplayName } from "@/util/randomName";

function sanitizeDestination(dest: string | null) {
  // 오픈 리다이렉트 방지: 내부 경로만 허용
  if (!dest) return "/";
  try {
    const decoded = decodeURIComponent(dest);
    if (!decoded.startsWith("/")) return "/";
    if (decoded.startsWith("//")) return "/";
    return decoded;
  } catch {
    return "/";
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const destination = sanitizeDestination(url.searchParams.get("destination"));

  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(new URL(`/login?error=auth`, url.origin));
  }

  const displayName = generateRandomDisplayName();
  const now = new Date().toISOString();

  const { error: upsertError } = await supabase.from("user_profile").upsert(
    {
      id: user.id,
      display_name: displayName,
      role: "QUESTIONER",
      created_at: now,
      updated_at: now,
    },
    { onConflict: "id" },
  );

  if (upsertError) {
    // 프로필 생성 실패해도 로그인은 성공
    console.error("login success but profile generation failed", upsertError);
    return NextResponse.redirect(new URL(`/login?error=profile`, url.origin));
  }

  return NextResponse.redirect(new URL(destination, url.origin));
}
