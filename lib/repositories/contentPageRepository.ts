import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const TABLE = "content_pages";

export async function getContentPage(slug: string) {
  const db = createSupabaseAdminClient();
  const { data } = await db.from(TABLE).select("*").eq("slug", slug).single();
  return data;
}

export async function saveContentPage(slug: string, values: { title?: string; body: string }) {
  const db = createSupabaseAdminClient();
  const { error } = await db
    .from(TABLE)
    .upsert({ slug, ...values, updated_at: new Date().toISOString() }, { onConflict: "slug" });
  if (error) throw new Error(error.message);
}
