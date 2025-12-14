import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/server/supabase/config";
import { ensureUserProfile } from "@/server/profileSetup";

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

  const ensured = await ensureUserProfile({ supabase, userId: user.id });
  if (!ensured.ok) {
    console.error("ensure profile failed:", ensured.step, ensured.error);
    return NextResponse.redirect(
      new URL(`/login?error=profile_${ensured.step}`, url.origin),
    );
  }

  return NextResponse.redirect(new URL(destination, url.origin));
}
