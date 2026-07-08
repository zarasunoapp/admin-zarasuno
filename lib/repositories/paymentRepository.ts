import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { range, type ListParams, type ListResult } from "./types";

export async function listManualPayments(params: ListParams): Promise<ListResult<any>> {
  const db = createSupabaseAdminClient();
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 10;
  const { start, end } = range(page, perPage);

  let query = db
    .from("transactions")
    .select(
      "*, profiles:user_id(full_name,email), coin_packages:package_id(name,coin_amount)",
      { count: "exact" }
    )
    .in("payment_provider", ["jazzcash", "easypaisa", "manual"])
    .eq("payment_status", "pending");
  if (params.q) query = query.ilike("id", `%${params.q}%`);
  query = query.order("created_at", { ascending: false }).range(start, end);

  const { data, count } = await query;
  return { rows: data ?? [], count: count ?? 0, page, perPage };
}

export async function approveManualPayment(transactionId: string) {
  const db = createSupabaseAdminClient();
  const { data: tx } = await db
    .from("transactions")
    .select("*, coin_packages:package_id(coin_amount)")
    .eq("id", transactionId)
    .single();
  if (!tx) throw new Error("Transaction not found");

  const coins = tx.coin_change || tx.coin_packages?.coin_amount || 0;
  const { data: profile } = await db
    .from("profiles")
    .select("coin_balance")
    .eq("id", tx.user_id)
    .single();
  const current = profile?.coin_balance ?? 0;

  await db.from("profiles").update({ coin_balance: current + coins }).eq("id", tx.user_id);
  const { error } = await db
    .from("transactions")
    .update({ payment_status: "completed", coin_change: coins })
    .eq("id", transactionId);
  if (error) throw new Error(error.message);
}

export async function rejectManualPayment(transactionId: string) {
  const db = createSupabaseAdminClient();
  const { error } = await db
    .from("transactions")
    .update({ payment_status: "failed" })
    .eq("id", transactionId);
  if (error) throw new Error(error.message);
}

export async function listPaymentConfigs() {
  const db = createSupabaseAdminClient();
  const { data } = await db.from("payment_configs").select("*").order("sort_order");
  return data ?? [];
}

export async function createPaymentConfig(values: Record<string, unknown>) {
  const db = createSupabaseAdminClient();
  const { data, error } = await db.from("payment_configs").insert(values).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updatePaymentConfig(id: string, values: Record<string, unknown>) {
  const db = createSupabaseAdminClient();
  const { error } = await db.from("payment_configs").update(values).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deletePaymentConfig(id: string) {
  const db = createSupabaseAdminClient();
  const { error } = await db.from("payment_configs").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function upsertPaymentConfig(values: Record<string, unknown>) {
  const db = createSupabaseAdminClient();
  const { error } = await db.from("payment_configs").upsert(values);
  if (error) throw new Error(error.message);
}
