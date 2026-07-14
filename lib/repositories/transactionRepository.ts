import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { range, type ListParams, type ListResult } from "./types";

const TABLE = "transactions";
const SELECT =
  "*, profiles:user_id(id,full_name,email), coin_packages:package_id(name), books:book_id(title, authors:author_id(name), publishers:publisher_id(name))";

function applySalesFilters(query: any, params: ListParams) {
  if (params.q)
    query = query.or(`payment_provider.ilike.%${params.q}%,payment_reference.ilike.%${params.q}%`);
  if (params.from) query = query.gte("created_at", params.from);
  if (params.to) query = query.lte("created_at", `${params.to}T23:59:59`);
  if (params.status) query = query.eq("payment_status", params.status);
  return query;
}

export async function listSales(params: ListParams): Promise<ListResult<any>> {
  const db = createSupabaseAdminClient();
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 10;
  const { start, end } = range(page, perPage);

  let query = db
    .from(TABLE)
    .select(SELECT, { count: "exact" })
    .eq("type", "purchase")
    .eq("payment_status", "completed");
  query = applySalesFilters(query, params);
  query = query.order("created_at", { ascending: false }).range(start, end);

  const { data, count } = await query;
  return { rows: data ?? [], count: count ?? 0, page, perPage };
}

export async function listAllSalesForExport(params: ListParams) {
  const db = createSupabaseAdminClient();
  let query = db.from(TABLE).select(SELECT).eq("type", "purchase").eq("payment_status", "completed");
  query = applySalesFilters(query, params);
  const { data } = await query.order("created_at", { ascending: false }).limit(10000);
  return data ?? [];
}

export async function listPurchaseReport(params: ListParams): Promise<ListResult<any>> {
  const db = createSupabaseAdminClient();
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 10;
  const { start, end } = range(page, perPage);

  let query = db
    .from(TABLE)
    .select(SELECT, { count: "exact" })
    .eq("type", "spend")
    .not("book_id", "is", null);
  if (params.q) query = query.ilike("payment_reference", `%${params.q}%`);
  if (params.from) query = query.gte("created_at", params.from);
  if (params.to) query = query.lte("created_at", `${params.to}T23:59:59`);
  query = query.order("created_at", { ascending: false }).range(start, end);

  const { data, count } = await query;
  return { rows: data ?? [], count: count ?? 0, page, perPage };
}

export async function listCoinPurchaseReport(params: ListParams): Promise<ListResult<any>> {
  const db = createSupabaseAdminClient();
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 10;
  const { start, end } = range(page, perPage);

  let query = db
    .from(TABLE)
    .select(SELECT, { count: "exact" })
    .in("type", ["purchase", "admin_grant"]);
  if (params.q) query = query.ilike("payment_reference", `%${params.q}%`);
  if (params.from) query = query.gte("created_at", params.from);
  if (params.to) query = query.lte("created_at", `${params.to}T23:59:59`);
  query = query.order("created_at", { ascending: false }).range(start, end);

  const { data, count } = await query;
  return { rows: data ?? [], count: count ?? 0, page, perPage };
}

export async function listLatestTransactions(limit = 8) {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from(TABLE)
    .select("id,created_at,amount,payment_status,type, profiles:user_id(full_name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function reportForExport(
  variant: "purchase" | "coin-purchase",
  params: ListParams
) {
  const list = variant === "purchase" ? listPurchaseReport : listCoinPurchaseReport;
  const { rows } = await list({ ...params, page: 1, perPage: 10000 });
  return rows;
}
