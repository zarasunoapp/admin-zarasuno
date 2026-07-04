import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { range, type ListParams, type ListResult } from "./types";

const TABLE = "feedback";

export async function listFeedback(params: ListParams): Promise<ListResult<any>> {
  const db = createSupabaseAdminClient();
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 10;
  const { start, end } = range(page, perPage);

  let query = db.from(TABLE).select("*, profiles:user_id(full_name,email)", { count: "exact" });
  if (params.q) query = query.ilike("message", `%${params.q}%`);
  if (params.status) query = query.eq("status", params.status);
  query = query.order("created_at", { ascending: false }).range(start, end);

  const { data, count } = await query;
  return { rows: data ?? [], count: count ?? 0, page, perPage };
}

export async function setFeedbackStatus(id: string, status: string) {
  const db = createSupabaseAdminClient();
  const { error } = await db.from(TABLE).update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteFeedback(id: string) {
  const db = createSupabaseAdminClient();
  const { error } = await db.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
}
