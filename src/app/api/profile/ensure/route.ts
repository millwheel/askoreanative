import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/server/supabase/server";
import { supabaseAdmin } from "@/server/supabase/admin";
import { generateRandomDisplayName } from "@/util/randomName";

export async function POST() {
  // 1) 현재 로그인 유저 확인 (쿠키 세션 기반)
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = data.user;

  // 2) 프로필 존재 확인
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("user_profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  if (profile) {
    return NextResponse.json({ ok: true, created: false });
  }

  // 3) 없으면 생성 (서버에서 시간/값 주입)
  const now = new Date().toISOString();

  const { error: insertError } = await supabaseAdmin
    .from("user_profiles")
    .insert({
      id: user.id,
      name: user.email ?? null,
      display_name: generateRandomDisplayName(),
      role: "QUESTIONER",
      is_verified: false,
      created_at: now,
      updated_at: now,
    });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, created: true });
}
