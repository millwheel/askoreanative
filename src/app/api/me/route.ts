import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/server/supabase/server";

export async function GET() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError)
    return NextResponse.json({ error: userError.message }, { status: 401 });
  if (!user) return NextResponse.json(null, { status: 200 });

  const { data: profile, error: profileError } = await supabase
    .from("user_profile")
    .select("display_name, role")
    .eq("id", user.id)
    .single();

  if (profileError)
    return NextResponse.json({ error: profileError.message }, { status: 500 });

  return NextResponse.json({
    id: user.id,
    email: user.email,
    displayName: profile.display_name,
    role: profile.role,
  });
}
