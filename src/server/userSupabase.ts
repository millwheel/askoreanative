import { getSupabaseServerClient } from "@/server/supabase/config";
import { NextResponse } from "next/server";
import { SupabaseClient, User } from "@supabase/supabase-js";

type Ok = { ok: true; supabase: SupabaseClient; user: User };
type Fail = { ok: false; res: NextResponse };

export type GetUserWithSupabaseResult = Ok | Fail;

export async function getUserAndSupabase(): Promise<GetUserWithSupabaseResult> {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return {
      ok: false,
      res: NextResponse.json({ error: error.message }, { status: 401 }),
    };
  }
  if (!user) {
    return {
      ok: false,
      res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { ok: true, supabase, user };
}
