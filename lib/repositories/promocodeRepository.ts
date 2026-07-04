import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { range, type ListParams, type ListResult } from "./types";

const TABLE = "promocodes";

export async function listPromocodes(params: ListParams): Promise<ListResult<any>> {
  const db = createSupabaseAdminClient();
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 10;
  const { start, end } = range(page, perPage);

  let query = db.from(TABLE).select("*", { count: "exact" });
  if (params.q) query = query.or(`name.ilike.%${params.q}%,code.ilike.%${params.q}%`);
  query = query.order(params.sort || "created_at", { ascending: params.dir === "asc" }).range(start, end);

  const { data, count } = await query;
  return { rows: data ?? [], count: count ?? 0, page, perPage };
}

export async function getPromocode(id: string) {
  const db = createSupabaseAdminClient();
  const { data } = await db.from(TABLE).select("*").eq("id", id).single();
  return data;
}

export async function createPromocode(values: Record<string, unknown>) {
  const db = createSupabaseAdminClient();
  const { data, error } = await db.from(TABLE).insert(values).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updatePromocode(id: string, values: Record<string, unknown>) {
  const db = createSupabaseAdminClient();
  const { data, error } = await db.from(TABLE).update(values).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deletePromocode(id: string) {
  const db = createSupabaseAdminClient();
  const { error } = await db.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listRedemptions(promocodeId: string) {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("promocode_redemptions")
    .select("*, profiles:user_id(full_name,email)")
    .eq("promocode_id", promocodeId)
    .order("created_at", { ascending: false });
  return data ?? [];
}
