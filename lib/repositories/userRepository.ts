import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { range, type ListParams, type ListResult } from "./types";

const TABLE = "profiles";

export async function listUsers(params: ListParams): Promise<ListResult<any>> {
  const db = createSupabaseAdminClient();
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 10;
  const { start, end } = range(page, perPage);

  let query = db.from(TABLE).select("*", { count: "exact" });
  if (params.q)
    query = query.or(
      `full_name.ilike.%${params.q}%,email.ilike.%${params.q}%,customer_number.ilike.%${params.q}%,phone.ilike.%${params.q}%`
    );
  if (params.status) query = query.eq("status", params.status);
  if (params.filter) query = query.eq("group_name", params.filter);
  query = query.order(params.sort || "created_at", { ascending: params.dir === "asc" }).range(start, end);

  const { data, count } = await query;
  return { rows: data ?? [], count: count ?? 0, page, perPage };
}

export async function getUser(id: string) {
  const db = createSupabaseAdminClient();
  const { data } = await db.from(TABLE).select("*").eq("id", id).single();
  return data;
}

export async function setUserStatus(id: string, status: string) {
  const db = createSupabaseAdminClient();
  const { error } = await db.from(TABLE).update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function setUserRole(id: string, role: string) {
  const db = createSupabaseAdminClient();
  const { error } = await db.from(TABLE).update({ role }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteUser(id: string) {
  const db = createSupabaseAdminClient();
  await db.auth.admin.deleteUser(id).catch(() => null);
  const { error } = await db.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function grantCoins(userId: string, amount: number, note?: string) {
  const db = createSupabaseAdminClient();
  const { data: profile } = await db.from(TABLE).select("coin_balance").eq("id", userId).single();
  const current = profile?.coin_balance ?? 0;
  const { error: balError } = await db
    .from(TABLE)
    .update({ coin_balance: current + amount })
    .eq("id", userId);
  if (balError) throw new Error(balError.message);

  const { error: txError } = await db.from("transactions").insert({
    user_id: userId,
    type: "admin_grant",
    coin_change: amount,
    payment_provider: "none",
    payment_status: "completed",
    payment_reference: note ?? null,
  });
  if (txError) throw new Error(txError.message);
}

export async function grantBookAccess(userId: string, bookId: string) {
  const db = createSupabaseAdminClient();
  const { error } = await db
    .from("book_unlocks")
    .insert({ user_id: userId, book_id: bookId, unlock_method: "admin", coins_spent: 0 });
  if (error) throw new Error(error.message);
}

export async function getUserTransactions(userId: string) {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("transactions")
    .select("*, coin_packages:package_id(name), books:book_id(title)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getUserUnlocks(userId: string) {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("book_unlocks")
    .select("*, books:book_id(title,cover_url)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getUserFavourites(userId: string) {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("favourites")
    .select("*, books:book_id(title,cover_url)")
    .eq("user_id", userId);
  return data ?? [];
}

export async function getUserProgress(userId: string) {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("listening_progress")
    .select("*, books:book_id(title)")
    .eq("user_id", userId)
    .order("last_listened_at", { ascending: false });
  return data ?? [];
}

export async function listGroups() {
  const db = createSupabaseAdminClient();
  const { data } = await db.from(TABLE).select("group_name").not("group_name", "is", null);
  const set = new Set<string>();
  (data ?? []).forEach((r: any) => r.group_name && set.add(r.group_name));
  return Array.from(set).sort();
}

export async function countUsers() {
  const db = createSupabaseAdminClient();
  const { count } = await db.from(TABLE).select("id", { count: "exact", head: true });
  return count ?? 0;
}
