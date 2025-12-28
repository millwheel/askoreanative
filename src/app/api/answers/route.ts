import { NextResponse } from "next/server";
import type { AnswerCreateRequest, AnswerCreateResponse } from "@/type/answer";
import { getSupabaseServerClient } from "@/server/supabase/config";

const MAX_TITLE_LEN = 100;
const MAX_CONTENT_LEN = 30000;

// ---------------- POST ----------------
export async function POST(req: Request) {
  const supabase = await getSupabaseServerClient();

  // 1) 로그인 체크
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

  // 2) body 파싱 및 answer 유효성 검증
  let body: AnswerCreateRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const questionId = Number(body.questionId);
  const title = (body.title ?? "").trim();
  const content = (body.content ?? "").trim();

  if (!Number.isFinite(questionId) || questionId <= 0) {
    return NextResponse.json(
      { error: "questionId is required" },
      { status: 400 },
    );
  }

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (title.length > MAX_TITLE_LEN) {
    return NextResponse.json(
      { error: `title must be <= ${MAX_TITLE_LEN} chars` },
      { status: 400 },
    );
  }

  if (!content) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }
  if (content.length > MAX_CONTENT_LEN) {
    return NextResponse.json(
      { error: `content must be <= ${MAX_CONTENT_LEN} chars` },
      { status: 400 },
    );
  }

  // 3) ANSWERER 권한 체크
  const { data: profile, error: profileError } = await supabase
    .from("user_profile")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error(profileError.message);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  if (!profile || profile.role !== "ANSWERER") {
    return NextResponse.json(
      { error: "Only Answerer can create answers" },
      { status: 403 },
    );
  }

  // 4) question 존재 여부 확인
  const { data: question, error: questionError } = await supabase
    .from("question")
    .select("id")
    .eq("id", questionId)
    .maybeSingle();

  if (questionError) {
    console.error(questionError.message);
    return NextResponse.json({ error: questionError.message }, { status: 500 });
  }

  if (!question) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  // 5) answer insert
  const now = new Date().toISOString();

  const { data: insertedAnswer, error: insertError } = await supabase
    .from("answer")
    .insert({
      question_id: questionId,
      author_id: user.id,
      title,
      content,
      upvote_count: 0,
      created_at: now,
      updated_at: now,
    })
    .select("id")
    .single();

  if (insertError) {
    console.error(insertError.message);
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const res: AnswerCreateResponse = {
    answerId: insertedAnswer.id,
  };

  return NextResponse.json(res, { status: 201 });
}
