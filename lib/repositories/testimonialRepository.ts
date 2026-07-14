import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const TABLE = "testimonials";

export async function listTestimonials() {
  const db = createSupabaseAdminClient();
  const { data } = await db.from(TABLE).select("*").order("sort_order");
  return data ?? [];
}

export async function createTestimonial(values: Record<string, unknown>) {
  const db = createSupabaseAdminClient();
  const { data, error } = await db.from(TABLE).insert(values).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateTestimonial(id: string, values: Record<string, unknown>) {
  const db = createSupabaseAdminClient();
  const { error } = await db.from(TABLE).update(values).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteTestimonial(id: string) {
  const db = createSupabaseAdminClient();
  const { error } = await db.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
}
