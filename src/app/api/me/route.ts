import { NextResponse } from "next/server";
import { getUserAndSupabase } from "@/server/userSupabase";

export async function GET() {
  // 1) 로그인 체크 & supabase client 준비
  const userSupabase = await getUserAndSupabase();
  if (!userSupabase.ok) return userSupabase.res;
  const { supabase, user } = userSupabase;

  const { data: profile, error: profileError } = await supabase
    .from("user_profile")
    .select("display_name, role, avatar_url")
    .eq("id", user.id)
    .single();

  if (profileError)
    return NextResponse.json({ error: profileError.message }, { status: 500 });

  return NextResponse.json({
    id: user.id,
    email: user.email,
    displayName: profile.display_name,
    role: profile.role,
    avatarUrl: profile.avatar_url,
  });
}
