import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/server/supabase/config";

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const questionId = Number(id);

  if (!questionId) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const supabase = await getSupabaseServerClient();

  const { error } = await supabase.rpc("increment_question_view", {
    question_id: questionId,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
