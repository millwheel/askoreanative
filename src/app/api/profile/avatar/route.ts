import { NextResponse } from "next/server";
import { getUserAndSupabase } from "@/server/userSupabase";

export const runtime = "nodejs";

const BUCKET = "avatars";

export async function PUT(req: Request) {
  const result = await getUserAndSupabase();
  if (!result.ok) return result.res;
  const { supabase, user } = result;

  const form = await req.formData();
  const file = form.get("avatar");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "avatar file is required" },
      { status: 400 },
    );
  }

  // Validation
  if (file.size <= 0) {
    return NextResponse.json({ error: "empty file" }, { status: 400 });
  }

  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json(
      { error: "avatar too large (max 2MB)" },
      { status: 400 },
    );
  }

  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    return NextResponse.json(
      { error: "unsupported image type" },
      { status: 400 },
    );
  }

  const folderPrefix = `${user.id}/`;

  /* -------------------------------------------------
   * 1) 기존 프로필 이미지 전부 삭제
   * ------------------------------------------------- */
  const { data: existingFiles, error: listErr } = await supabase.storage
    .from(BUCKET)
    .list(folderPrefix);

  if (listErr) {
    return NextResponse.json({ error: listErr.message }, { status: 500 });
  }

  if (existingFiles && existingFiles.length > 0) {
    const pathsToRemove = existingFiles.map((f) => `${folderPrefix}${f.name}`);

    const { error: removeErr } = await supabase.storage
      .from(BUCKET)
      .remove(pathsToRemove);

    if (removeErr) {
      return NextResponse.json({ error: removeErr.message }, { status: 500 });
    }
  }

  /* -------------------------------------------------
   * 2) 새 이미지 업로드 (원본 파일명 유지)
   * ------------------------------------------------- */
  const uploadPath = `${folderPrefix}${file.name}`;

  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(uploadPath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadErr) {
    return NextResponse.json({ error: uploadErr.message }, { status: 500 });
  }

  /* -------------------------------------------------
   * 3) public URL 생성
   * ------------------------------------------------- */
  const { data: publicData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(uploadPath);

  const avatarUrl = publicData.publicUrl;

  /* -------------------------------------------------
   * 4) DB 업데이트
   * ------------------------------------------------- */
  const { error: updateErr } = await supabase
    .from("user_profile")
    .update({
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ avatarUrl }, { status: 200 });
}
