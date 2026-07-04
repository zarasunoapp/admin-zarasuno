import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const TABLE = "chapters";

export async function listChaptersByBook(bookId: string) {
  const db = createSupabaseAdminClient();
  const { data } = await db.from(TABLE).select("*").eq("book_id", bookId).order("chapter_number");
  return data ?? [];
}

export async function createChapter(values: {
  book_id: string;
  chapter_number: number;
  title: string;
  audio_path?: string | null;
  duration_seconds?: number | null;
  is_preview?: boolean;
}) {
  const db = createSupabaseAdminClient();
  const { data, error } = await db.from(TABLE).insert(values).select().single();
  if (error) throw new Error(error.message);
  await recomputeBookStats(values.book_id);
  return data;
}

export async function bulkCreateChapters(
  bookId: string,
  rows: { title: string; audio_path?: string | null; duration_seconds?: number | null; is_preview?: boolean }[]
) {
  const db = createSupabaseAdminClient();
  const { data: existing } = await db
    .from(TABLE)
    .select("chapter_number")
    .eq("book_id", bookId)
    .order("chapter_number", { ascending: false })
    .limit(1);
  let next = (existing?.[0]?.chapter_number ?? 0) + 1;
  const payload = rows.map((r) => ({
    book_id: bookId,
    chapter_number: next++,
    title: r.title,
    audio_path: r.audio_path ?? null,
    duration_seconds: r.duration_seconds ?? null,
    is_preview: r.is_preview ?? false,
  }));
  const { error } = await db.from(TABLE).insert(payload);
  if (error) throw new Error(error.message);
  await recomputeBookStats(bookId);
}

export async function updateChapter(id: string, bookId: string, values: Record<string, unknown>) {
  const db = createSupabaseAdminClient();
  const { data, error } = await db.from(TABLE).update(values).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  await recomputeBookStats(bookId);
  return data;
}

export async function deleteChapter(id: string, bookId: string) {
  const db = createSupabaseAdminClient();
  const { error } = await db.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
  await recomputeBookStats(bookId);
}

export async function reorderChapters(bookId: string, orderedIds: string[]) {
  const db = createSupabaseAdminClient();
  await Promise.all(
    orderedIds.map((id, index) =>
      db.from(TABLE).update({ chapter_number: index + 1 }).eq("id", id)
    )
  );
  await recomputeBookStats(bookId);
}

export async function recomputeBookStats(bookId: string) {
  const db = createSupabaseAdminClient();
  const { data } = await db.from(TABLE).select("duration_seconds").eq("book_id", bookId);
  const chapterCount = data?.length ?? 0;
  const durationSeconds = (data ?? []).reduce(
    (sum, c: any) => sum + (c.duration_seconds || 0),
    0
  );
  await db
    .from("books")
    .update({ chapter_count: chapterCount, duration_seconds: durationSeconds })
    .eq("id", bookId);
}
