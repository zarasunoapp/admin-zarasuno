import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const TABLE = "hero_features";

export async function listHeroFeatures() {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from(TABLE)
    .select("*, books:book_id(id,title,cover_url, authors:author_id(name))")
    .order("sort_order")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function createHeroFeature(values: Record<string, unknown>) {
  const db = createSupabaseAdminClient();
  const { data, error } = await db.from(TABLE).insert(values).select().single();
  if (error) throw new Error(error.message);
  if (values.is_active) await deactivateOthers(data.id);
  return data;
}

export async function updateHeroFeature(id: string, values: Record<string, unknown>) {
  const db = createSupabaseAdminClient();
  const { error } = await db.from(TABLE).update(values).eq("id", id);
  if (error) throw new Error(error.message);
  if (values.is_active) await deactivateOthers(id);
}

export async function deleteHeroFeature(id: string) {
  const db = createSupabaseAdminClient();
  const { error } = await db.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
}

async function deactivateOthers(keepId: string) {
  const db = createSupabaseAdminClient();
  await db.from(TABLE).update({ is_active: false }).neq("id", keepId).eq("is_active", true);
}
