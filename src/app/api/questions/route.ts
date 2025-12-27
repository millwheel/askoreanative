import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/server/supabase/config";
import {
  QuestionCreateRequest,
  QuestionIdTopicQueryDto,
  QuestionStatus,
  QuestionSummaryResponse,
} from "@/type/question";
import { TopicQueryDto, TopicSummaryResponse } from "@/type/topic";
import { makeExcerpt } from "@/util/excerpt";

const PAGE_SIZE = 20;

export async function GET(req: Request) {
  const supabase = await getSupabaseServerClient();
  const url = new URL(req.url);
  const limit = PAGE_SIZE;
  const offset = Math.max(Number(url.searchParams.get("offset") ?? 0), 0);

  // 1) question 목록
  const { data: questions, error: questionError } = await supabase
    .from("question")
    .select("id, author_id, title, content, view_count, created_at")
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
  const { data: questionTopicMappings, error: qtErr } = await supabase
    .from("question_topic_mapping")
    .select("question_id, topic:topic_id(id, slug, name)")
    .in("question_id", questionIds);

  if (qtErr) {
    return NextResponse.json({ error: qtErr.message }, { status: 500 });
  }

  const topicsByQuestionId = (
    questionTopicMappings as QuestionIdTopicQueryDto[]
  ).reduce((map, row) => {
    const topics = row.topic
      ? Array.isArray(row.topic)
        ? row.topic
        : [row.topic]
      : [];

    if (topics.length === 0) return map;

    const arr = map.get(row.question_id);
    if (arr) arr.push(...topics);
    else map.set(row.question_id, [...topics]);
    return map;
  }, new Map<number, TopicQueryDto[]>());

  // 4) 응답 조립
  const result: QuestionSummaryResponse[] = questions.map((q) => {
    const profile = profileMap.get(q.author_id);

    const topicSummaries: TopicSummaryResponse[] =
      topicsByQuestionId.get(q.id)?.map((topicQuery) => ({
        id: topicQuery.id,
        slug: topicQuery.slug,
        name: topicQuery.name,
      })) ?? [];

    return {
      id: q.id,
      authorDisplayName: profile?.display_name ?? "",
      authorAvatarUrl: profile?.avatar_url ?? null,
      title: q.title,
      excerpt: makeExcerpt(q.content),
      viewCount: q.view_count,
      createdAt: q.created_at,
      topics: topicSummaries,
    };
  });

  return NextResponse.json(result);
}

// --------------- POST -------------------
const MAX_TITLE_LEN = 100;
const MAX_DESC_LEN = 30000;

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

  // 2) 바디 파싱 및 question 유효성 검증
  let body: QuestionCreateRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const title = (body.title ?? "").trim();
  const content = (body.content ?? "").trim();
  const status: QuestionStatus = "OPEN";

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
  if (content.length > MAX_DESC_LEN) {
    return NextResponse.json(
      { error: `content must be <= ${MAX_DESC_LEN} chars` },
      { status: 400 },
    );
  }

  // 3) topicIds 유효성 검증
  const topicIds =
    body.topicIds && Array.isArray(body.topicIds)
      ? Array.from(
          new Set(
            body.topicIds
              .map((x) => Number(x))
              .filter((x) => Number.isFinite(x) && x > 0),
          ),
        )
      : [];

  if (topicIds.length > 0) {
    const { data: existingTopics, error: topicCheckError } = await supabase
      .from("topic")
      .select("id")
      .in("id", topicIds);

    if (topicCheckError) {
      console.error(topicCheckError.message);
      return NextResponse.json(
        { error: topicCheckError.message },
        { status: 500 },
      );
    }

    const existingTopicIds = new Set((existingTopics ?? []).map((t) => t.id));
    const missing = topicIds.filter((id) => !existingTopicIds.has(id));
    if (missing.length > 0) {
      return NextResponse.json(
        {
          error: "Some topicIds do not exist",
          missingTopicIds: missing,
        },
        { status: 400 },
      );
    }
  }

  // 4) question insert
  const now = new Date().toISOString();

  const { data: insertedQuestion, error: insertQuestionError } = await supabase
    .from("question")
    .insert({
      author_id: user.id,
      title,
      content: content,
      view_count: 0,
      status,
      created_at: now,
      updated_at: now,
    })
    .select("id")
    .single();

  if (insertQuestionError) {
    console.error(insertQuestionError.message);
    return NextResponse.json(
      { error: insertQuestionError.message },
      { status: 500 },
    );
  }

  // 5) question_topic insert
  if (topicIds.length > 0) {
    const mappingRows = topicIds.map((topicId) => ({
      question_id: insertedQuestion.id,
      topic_id: topicId,
      created_at: now,
      updated_at: now,
    }));

    const { error: insertMappingError } = await supabase
      .from("question_topic_mapping")
      .insert(mappingRows);

    if (insertMappingError) {
      console.error(insertMappingError.message);
      return NextResponse.json(
        {
          error: insertMappingError.message,
          questionId: insertedQuestion.id,
        },
        { status: 500 },
      );
    }
  }

  return NextResponse.json(
    {
      questionId: insertedQuestion.id,
      topicIds,
    },
    { status: 201 },
  );
}
