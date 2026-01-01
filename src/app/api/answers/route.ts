import { NextResponse } from "next/server";
import type {
  AnswerCreateRequest,
  AnswerCreateResponse,
  AnswerQueryDto,
  AnswerResponse,
} from "@/type/answer";
import { getSupabaseServerClient } from "@/server/supabase/config";
import { getUserAndSupabase } from "@/server/userSupabase";

export async function GET(req: Request) {
  const supabase = await getSupabaseServerClient();
  const url = new URL(req.url);
  const questionIdRaw = url.searchParams.get("questionId");
  const questionId = Number(questionIdRaw);

  if (!questionIdRaw || Number.isNaN(questionId) || questionId <= 0) {
    return NextResponse.json(
      { error: "Invalid or missing questionId." },
      { status: 400 },
    );
  }

  // 1) answer 목록
  const { data: answers, error: answerError } = await supabase
    .from("answer")
    .select(
      "id, question_id, author_id, title, content, upvote_count, created_at, updated_at",
    )
    .eq("question_id", questionId)
    .order("created_at", { ascending: false });

  if (answerError) {
    return NextResponse.json({ error: answerError.message }, { status: 500 });
  }

  const answerRows = (answers ?? []) as AnswerQueryDto[];

  // 답변 없으면 바로 리턴
  if (answerRows.length === 0) {
    const result: AnswerResponse[] = [];
    return NextResponse.json(result);
  }

  // 2) 작성자 프로필
  const authorIds = [...new Set(answerRows.map((a) => a.author_id))];

  const { data: profiles, error: profileError } = await supabase
    .from("user_profile")
    .select("id, display_name, avatar_url")
    .in("id", authorIds);

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  const profileMap = new Map<
    string,
    { display_name: string; avatar_url: string | null }
  >((profiles ?? []).map((p) => [p.id, p]));

  // 3) 응답 조립
  const result: AnswerResponse[] = answerRows.map((a) => {
    const profile = profileMap.get(a.author_id);

    return {
      id: a.id,
      questionId: a.question_id,
      authorDisplayName: profile?.display_name ?? "",
      authorAvatarUrl: profile?.avatar_url ?? null,
      title: a.title,
      content: a.content,
      upvoteCount: a.upvote_count ?? 0,
      createdAt: a.created_at,
      updatedAt: a.updated_at,
    };
  });

  return NextResponse.json(result);
}
// ---------------- POST ----------------
const MAX_TITLE_LEN = 100;
const MAX_CONTENT_LEN = 30000;
export async function POST(req: Request) {
  // 1) 로그인 체크 & supabase client 준비
  const userSupabase = await getUserAndSupabase();
  if (!userSupabase.ok) return userSupabase.res;
  const { supabase, user } = userSupabase;

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
