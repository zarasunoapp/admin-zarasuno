import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { range, type ListParams, type ListResult } from "./types";

const TABLE = "faqs";

export async function listFaqs(params: ListParams): Promise<ListResult<any>> {
  const db = createSupabaseAdminClient();
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 10;
  const { start, end } = range(page, perPage);

  let query = db.from(TABLE).select("*", { count: "exact" });
  if (params.q) query = query.or(`question.ilike.%${params.q}%,answer.ilike.%${params.q}%`);
  query = query.order(params.sort || "sort_order", { ascending: params.dir !== "desc" }).range(start, end);

  const { data, count } = await query;
  return { rows: data ?? [], count: count ?? 0, page, perPage };
}

export async function createFaq(values: {
  question: string;
  answer: string;
  sort_order?: number;
  is_active?: boolean;
}) {
  const db = createSupabaseAdminClient();
  const { data, error } = await db.from(TABLE).insert(values).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateFaq(id: string, values: Record<string, unknown>) {
  const db = createSupabaseAdminClient();
  const { data, error } = await db.from(TABLE).update(values).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteFaq(id: string) {
  const db = createSupabaseAdminClient();
  const { error } = await db.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
}
