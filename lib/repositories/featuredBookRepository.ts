import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const TABLE = "featured_books";

export async function listFeaturedBooks() {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from(TABLE)
    .select("*, books:book_id(title,cover_url)")
    .order("sort_order");
  return data ?? [];
}

export async function createFeaturedBook(values: Record<string, unknown>) {
  const db = createSupabaseAdminClient();
  const { data, error } = await db.from(TABLE).insert(values).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateFeaturedBook(id: string, values: Record<string, unknown>) {
  const db = createSupabaseAdminClient();
  const { error } = await db.from(TABLE).update(values).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteFeaturedBook(id: string) {
  const db = createSupabaseAdminClient();
  const { error } = await db.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
}
