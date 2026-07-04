import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { range, type ListParams, type ListResult } from "./types";

const TABLE = "publishers";

export async function listPublishers(params: ListParams): Promise<ListResult<any>> {
  const db = createSupabaseAdminClient();
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 10;
  const { start, end } = range(page, perPage);

  let query = db.from(TABLE).select("*", { count: "exact" });
  if (params.q) query = query.or(`name.ilike.%${params.q}%,email.ilike.%${params.q}%`);
  query = query.order(params.sort || "name", { ascending: params.dir !== "desc" }).range(start, end);

  const { data, count } = await query;
  return { rows: data ?? [], count: count ?? 0, page, perPage };
}

export async function getPublisher(id: string) {
  const db = createSupabaseAdminClient();
  const { data } = await db.from(TABLE).select("*").eq("id", id).single();
  return data;
}

export async function createPublisher(values: { name: string; email?: string | null }) {
  const db = createSupabaseAdminClient();
  const { data, error } = await db.from(TABLE).insert(values).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updatePublisher(id: string, values: { name?: string; email?: string | null }) {
  const db = createSupabaseAdminClient();
  const { data, error } = await db.from(TABLE).update(values).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deletePublisher(id: string) {
  const db = createSupabaseAdminClient();
  const { error } = await db.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function bulkInsertPublishers(rows: { name: string; email?: string | null }[]) {
  const db = createSupabaseAdminClient();
  const { data, error } = await db.from(TABLE).insert(rows).select();
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listAllPublishers() {
  const db = createSupabaseAdminClient();
  const { data } = await db.from(TABLE).select("id,name").order("name");
  return data ?? [];
}
