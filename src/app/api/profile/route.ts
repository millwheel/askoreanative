import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/server/supabase/config";

type PatchBody = {
  name?: string;
  display_name?: string;
};

export async function GET() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 401 });
  }
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("user_profile")
    .select("id, name, display_name, role, created_at, updated_at")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({
    ...profile,
    email: user.email,
  });
}

export async function PATCH(req: Request) {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 401 });
  }
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: PatchBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rawName = body.name;
  const rawDisplayName = body.display_name;

  const name = typeof rawName === "string" ? rawName.trim() : null;
  const displayName =
    typeof rawDisplayName === "string" ? rawDisplayName.trim() : "";

  // display_name 은 필수
  if (!displayName) {
    return NextResponse.json(
      { error: "display_name is required" },
      { status: 400 },
    );
  }

  // 길이 제한
  if ((name !== null && name.length > 20) || displayName.length > 20) {
    return NextResponse.json(
      { error: "name/display_name too long" },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();

  const updatePayload: Record<string, unknown> = {
    display_name: displayName,
    updated_at: now,
  };

  // name이 전달된 경우에만 업데이트
  if (name !== null) {
    updatePayload.name = name;
  }

  const { data: updated, error: updateError } = await supabase
    .from("user_profile")
    .update(updatePayload)
    .eq("id", user.id)
    .select("id, name, display_name, role, created_at, updated_at")
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    ...updated,
    email: user.email,
  });
}
