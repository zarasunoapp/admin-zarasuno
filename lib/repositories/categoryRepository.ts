import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { range, type ListParams, type ListResult } from "./types";

const TABLE = "categories";

export async function listCategories(params: ListParams): Promise<ListResult<any>> {
  const db = createSupabaseAdminClient();
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 10;
  const { start, end } = range(page, perPage);

  let query = db.from(TABLE).select("*", { count: "exact" });
  if (params.q) query = query.ilike("name", `%${params.q}%`);
  query = query.order(params.sort || "sort_order", { ascending: params.dir !== "desc" }).range(start, end);

  const { data, count } = await query;
  return { rows: data ?? [], count: count ?? 0, page, perPage };
}

export async function createCategory(values: {
  name: string;
  slug: string;
  icon_url?: string | null;
  sort_order?: number;
  is_active?: boolean;
}) {
  const db = createSupabaseAdminClient();
  const { data, error } = await db.from(TABLE).insert(values).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateCategory(id: string, values: Record<string, unknown>) {
  const db = createSupabaseAdminClient();
  const { data, error } = await db.from(TABLE).update(values).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteCategory(id: string) {
  const db = createSupabaseAdminClient();
  const { error } = await db.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function setCategoryActive(id: string, isActive: boolean) {
  const db = createSupabaseAdminClient();
  const { error } = await db.from(TABLE).update({ is_active: isActive }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listAllCategories() {
  const db = createSupabaseAdminClient();
  const { data } = await db.from(TABLE).select("id,name,slug").order("sort_order");
  return data ?? [];
}
