import { getSupabaseServerClient } from "@/server/supabase/config";
import { NextResponse } from "next/server";
import { TopicResponse } from "@/type/topic";

export async function GET() {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("topic")
    .select(
      `
      id,
      slug,
      name,
      description,
      created_at,
      updated_at
    `,
    )
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const topics: TopicResponse[] = (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  return NextResponse.json(topics);
}
