import { NextResponse } from "next/server";
import { UserProfileRequest } from "@/type/user";
import { getUserAndSupabase } from "@/server/userSupabase";

export async function GET() {
  const userSupabase = await getUserAndSupabase();
  if (!userSupabase.ok) return userSupabase.res;
  const { supabase, user } = userSupabase;

  const { data: profile, error: error } = await supabase
    .from("user_profile")
    .select("name, display_name, role, avatar_url")
    .eq("id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: profile.name,
    displayName: profile.display_name,
    role: profile.role,
    avatarUrl: profile.avatar_url,
  });
}

export async function PATCH(req: Request) {
  const result = await getUserAndSupabase();
  if (!result.ok) return result.res;
  const { supabase, user } = result;

  const { name, displayName } = (await req.json()) as UserProfileRequest;

  // Validation
  if (!displayName) {
    return NextResponse.json(
      { error: "displayName is required" },
      { status: 400 },
    );
  }

  if ((name && name.length > 20) || displayName.length > 20) {
    return NextResponse.json(
      { error: "name or displayName too long" },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("user_profile")
    .update({
      name,
      display_name: displayName,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
