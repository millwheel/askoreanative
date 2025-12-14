import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/server/supabase/config";
import { generateRandomDisplayName } from "@/util/randomName";

function sanitizeDestination(dest: string | null) {
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
  const code = url.searchParams.get("code");

  const supabase = await getSupabaseServerClient();

  if (!code) {
    console.error("code not found");
    return NextResponse.redirect(new URL(`/login?error=code`, url.origin));
  }

  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    console.log("exchange failed:", exchangeError);
    return NextResponse.redirect(new URL(`/login?error=exchange`, url.origin));
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.log("user not found: ", userError);
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
