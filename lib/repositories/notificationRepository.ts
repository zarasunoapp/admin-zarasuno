import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { range, type ListParams, type ListResult } from "./types";

const TABLE = "notifications";

export async function listNotifications(params: ListParams): Promise<ListResult<any>> {
  const db = createSupabaseAdminClient();
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 10;
  const { start, end } = range(page, perPage);

  let query = db.from(TABLE).select("*", { count: "exact" });
  if (params.q) query = query.or(`title.ilike.%${params.q}%,body.ilike.%${params.q}%`);
  if (params.type) query = query.eq("audience", params.type);
  query = query.order("created_at", { ascending: false }).range(start, end);

  const { data, count } = await query;
  return { rows: data ?? [], count: count ?? 0, page, perPage };
}

export async function createNotification(values: {
  title: string;
  body?: string | null;
  audience: string;
  user_id?: string | null;
  show_in_popup?: boolean;
  image_url?: string | null;
}) {
  const db = createSupabaseAdminClient();
  const { data, error } = await db.from(TABLE).insert(values).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteNotification(id: string) {
  const db = createSupabaseAdminClient();
  const { error } = await db.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
}
