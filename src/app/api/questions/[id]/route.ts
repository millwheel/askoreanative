import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/server/supabase/config";
import type { TopicQueryDto, TopicSummaryResponse } from "@/type/topic";
import type {
  QuestionDetailResponse,
  QuestionIdTopicQueryDto,
  QuestionStatus,
} from "@/type/question";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const questionId = Number(id);

  if (!questionId) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const supabase = await getSupabaseServerClient();

  // 1) question 단건
  const { data: q, error: qErr } = await supabase
    .from("question")
    .select(
      "id, author_id, title, description, view_count, status, created_at, updated_at",
    )
    .eq("id", questionId)
    .single();

  if (qErr) {
    return NextResponse.json({ error: qErr.message }, { status: 404 });
  }

  // 2) 작성자 프로필 단건
  const { data: profile, error: pErr } = await supabase
    .from("user_profile")
    .select("id, display_name, avatar_url")
    .eq("id", q.author_id)
    .single();

  if (pErr) {
    return NextResponse.json({ error: pErr.message }, { status: 500 });
  }

  // 3) topic 조인
  const { data: questionTopicMappings, error: qtErr } = await supabase
    .from("question_topic_mapping")
    .select("question_id, topic:topic_id(id, slug, name)")
    .eq("question_id", questionId);

  if (qtErr) {
    return NextResponse.json({ error: qtErr.message }, { status: 500 });
  }

  const topics: TopicQueryDto[] = (
    (questionTopicMappings ?? []) as QuestionIdTopicQueryDto[]
  ).flatMap((questionIdQueryDto) => questionIdQueryDto.topic ?? []);

  const topicSummaries: TopicSummaryResponse[] = topics.map((t) => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
  }));

  const result: QuestionDetailResponse = {
    id: q.id,
    authorDisplayName: profile.display_name,
    authorAvatarUrl: profile.avatar_url ?? null,
    title: q.title,
    body: q.description ?? "",
    viewCount: q.view_count ?? 0,
    status: q.status as QuestionStatus,
    createdAt: q.created_at,
    updatedAt: q.updated_at,
    topics: topicSummaries,
  };

  return NextResponse.json(result);
}
