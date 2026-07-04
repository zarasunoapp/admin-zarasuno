import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { range, type ListParams, type ListResult } from "./types";

const TABLE = "subcategories";

export async function listSubcategories(params: ListParams): Promise<ListResult<any>> {
  const db = createSupabaseAdminClient();
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 10;
  const { start, end } = range(page, perPage);

  let query = db.from(TABLE).select("*, categories(name)", { count: "exact" });
  if (params.q) query = query.ilike("name", `%${params.q}%`);
  if (params.filter) query = query.eq("category_id", params.filter);
  query = query.order(params.sort || "sort_order", { ascending: params.dir !== "desc" }).range(start, end);

  const { data, count } = await query;
  return { rows: data ?? [], count: count ?? 0, page, perPage };
}

export async function createSubcategory(values: {
  name: string;
  slug: string;
  category_id: string;
  sort_order?: number;
  is_active?: boolean;
}) {
  const db = createSupabaseAdminClient();
  const { data, error } = await db.from(TABLE).insert(values).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateSubcategory(id: string, values: Record<string, unknown>) {
  const db = createSupabaseAdminClient();
  const { data, error } = await db.from(TABLE).update(values).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteSubcategory(id: string) {
  const db = createSupabaseAdminClient();
  const { error } = await db.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listAllSubcategories() {
  const db = createSupabaseAdminClient();
  const { data } = await db.from(TABLE).select("id,name,category_id").order("name");
  return data ?? [];
}

export async function listSubcategoriesByCategory(categoryId: string) {
  const db = createSupabaseAdminClient();
  const { data } = await db.from(TABLE).select("id,name").eq("category_id", categoryId).order("sort_order");
  return data ?? [];
}
