import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/server/supabase/config";
import { QuestionSummaryResponse } from "@/client/type/question";
import { TopicSummaryResponse } from "@/client/type/topic";

const PAGE_SIZE = 20;

function makeExcerpt(text: string, maxLen = 140) {
  const t = (text ?? "").trim().replace(/\s+/g, " ");
  if (t.length <= maxLen) return t;
  return t.slice(0, maxLen - 1) + "…";
}

export async function GET(req: Request) {
  const supabase = await getSupabaseServerClient();
  const url = new URL(req.url);
  const limit = PAGE_SIZE;
  const offset = Math.max(Number(url.searchParams.get("offset") ?? 0), 0);

  // 1) question 목록
  const { data: questions, error: questionError } = await supabase
    .from("question")
    .select("id, author_id, title, description, view_count, created_at")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (questionError) {
    return NextResponse.json({ error: questionError.message }, { status: 500 });
  }

  const questionIds = questions.map((q) => q.id);
  const authorIds = [...new Set(questions.map((q) => q.author_id))];

  // 2) 작성자 프로필
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
  >(profiles.map((p) => [p.id, p]));

  // 3) question_topic + topic join
  const { data: qts, error: qtErr } = await supabase
    .from("question_topic_mapping")
    .select("question_id, topic:topic_id(id, slug, name)")
    .in("question_id", questionIds);

  if (qtErr) {
    return NextResponse.json({ error: qtErr.message }, { status: 500 });
  }

  const topicsByQuestionId = new Map<number, TopicSummaryResponse[]>();
  for (const row of qts ?? []) {
    const topic = row.topic as {
      id: number;
      slug: string;
      name: string;
    } | null;
    if (!topic) continue;

    const list = topicsByQuestionId.get(row.question_id) ?? [];
    list.push({ id: topic.id, slug: topic.slug, name: topic.name });
    topicsByQuestionId.set(row.question_id, list);
  }

  // 4) 응답 조립
  const result: QuestionSummaryResponse[] = questions.map((q) => {
    const profile = profileMap.get(q.author_id);

    return {
      id: q.id,
      authorDisplayName: profile?.display_name ?? "Unknown",
      authorAvatarUrl: profile?.avatar_url ?? null,
      title: q.title,
      excerpt: makeExcerpt(q.description ?? ""),
      viewCount: q.view_count ?? 0,
      createdAt: q.created_at,
      topics: topicsByQuestionId.get(q.id) ?? [],
    };
  });

  return NextResponse.json(result);
}
