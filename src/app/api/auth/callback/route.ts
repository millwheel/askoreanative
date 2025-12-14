import { NextResponse } from "next/server";
import { generateRandomDisplayName } from "@/util/randomName";
import { getSupabaseServerClient } from "@/server/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const destination = url.searchParams.get("destination") ?? "/";

  const supabase = await getSupabaseServerClient();

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) {
    return NextResponse.redirect(new URL(`/login?error=oauth`, url.origin));
  }

  const user = userData.user;

  const displayName = generateRandomDisplayName();

  await supabase.from("user_profiles").upsert(
    {
      id: user.id,
      display_name: displayName,
      role: "QUESTIONER",
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
    { onConflict: "id", ignoreDuplicates: true }, // 이미 있으면 아무 것도 안 함
  );

  return NextResponse.redirect(new URL(destination, url.origin));
}
