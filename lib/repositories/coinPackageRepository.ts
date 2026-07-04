import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { range, type ListParams, type ListResult } from "./types";

const TABLE = "coin_packages";

export async function listCoinPackages(params: ListParams): Promise<ListResult<any>> {
  const db = createSupabaseAdminClient();
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 10;
  const { start, end } = range(page, perPage);

  let query = db.from(TABLE).select("*", { count: "exact" });
  if (params.q) query = query.or(`name.ilike.%${params.q}%,bundle_id.ilike.%${params.q}%`);
  if (params.status) query = query.eq("status", params.status);
  query = query.order(params.sort || "price", { ascending: params.dir !== "desc" }).range(start, end);

  const { data, count } = await query;
  return { rows: data ?? [], count: count ?? 0, page, perPage };
}

export async function createCoinPackage(values: {
  name: string;
  price: number;
  coin_amount: number;
  bundle_id?: string | null;
  status?: string;
  description?: string | null;
}) {
  const db = createSupabaseAdminClient();
  const payload = { ...values, is_active: (values.status ?? "active") === "active" };
  const { data, error } = await db.from(TABLE).insert(payload).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateCoinPackage(id: string, values: Record<string, unknown>) {
  const db = createSupabaseAdminClient();
  const payload = { ...values };
  if (typeof values.status === "string") payload.is_active = values.status === "active";
  const { data, error } = await db.from(TABLE).update(payload).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteCoinPackage(id: string) {
  const db = createSupabaseAdminClient();
  const { error } = await db.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listAllCoinPackages() {
  const db = createSupabaseAdminClient();
  const { data } = await db.from(TABLE).select("id,name").order("price");
  return data ?? [];
}
