import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { type ListParams } from "./types";

function applyDateRange(query: any, params: ListParams, column = "created_at") {
  if (params.from) query = query.gte(column, params.from);
  if (params.to) query = query.lte(column, `${params.to}T23:59:59`);
  return query;
}

export async function getConsumptionReport(params: ListParams) {
  const db = createSupabaseAdminClient();
  const BOOK_SELECT = "books:book_id(id,title,book_type, publishers:publisher_id(name))";

  const groups: Record<string, any> = {};
  const ensure = (book: any) => {
    if (params.type && book.book_type !== params.type) return null;
    if (!groups[book.id]) {
      groups[book.id] = {
        book_id: book.id,
        book_type: book.book_type,
        publisher_name: book.publishers?.name || "-",
        book_name: book.title,
        total_seconds: 0,
        finished: 0,
        purchases: 0,
      };
    }
    return groups[book.id];
  };

  // Purchases (book_unlocks) — includes books that were bought even if never listened
  let unlockQuery = db.from("book_unlocks").select(`book_id, ${BOOK_SELECT}`);
  unlockQuery = applyDateRange(unlockQuery, params, "created_at");
  const { data: unlocks } = await unlockQuery.limit(50000);
  (unlocks ?? []).forEach((u: any) => {
    const g = u.books && ensure(u.books);
    if (g) g.purchases += 1;
  });

  // Listening (time spent + finish clicked)
  let lpQuery = db
    .from("listening_progress")
    .select(`position_seconds, is_completed, ${BOOK_SELECT}`);
  lpQuery = applyDateRange(lpQuery, params, "last_listened_at");
  const { data: lp } = await lpQuery.limit(50000);
  (lp ?? []).forEach((r: any) => {
    const g = r.books && ensure(r.books);
    if (!g) return;
    g.total_seconds += r.position_seconds || 0;
    if (r.is_completed) g.finished += 1;
  });

  return Object.values(groups)
    .map((g: any) => ({
      book_type: g.book_type,
      publisher_name: g.publisher_name,
      book_name: g.book_name,
      total_minutes: Math.round(g.total_seconds / 60),
      finish_clicked: g.finished,
      number_of_purchases: g.purchases,
      consumption_share: Math.round(g.total_seconds / 60),
    }))
    .sort((a, b) => b.number_of_purchases - a.number_of_purchases || b.total_minutes - a.total_minutes);
}

export async function getStatisticsReport(params: ListParams) {
  const db = createSupabaseAdminClient();
  let bookQuery = db.from("books").select("id,title,book_type,listen_count");
  if (params.type) bookQuery = bookQuery.eq("book_type", params.type);
  const { data: books } = await bookQuery.limit(50000);

  const { data: progress } = await db
    .from("listening_progress")
    .select("book_id,user_id,is_completed");
  const { data: favs } = await db.from("favourites").select("book_id");

  const inProgress: Record<string, Set<string>> = {};
  (progress ?? []).forEach((p: any) => {
    if (p.is_completed) return;
    (inProgress[p.book_id] ||= new Set()).add(p.user_id);
  });
  const favCounts: Record<string, number> = {};
  (favs ?? []).forEach((f: any) => {
    favCounts[f.book_id] = (favCounts[f.book_id] || 0) + 1;
  });

  return (books ?? []).map((b: any) => ({
    book_type: b.book_type,
    book_name: b.title,
    click_read_listen: b.listen_count || 0,
    users_in_progress: inProgress[b.id]?.size || 0,
    users_favorite: favCounts[b.id] || 0,
  }));
}

export async function getPromocodeReport(params: ListParams) {
  const db = createSupabaseAdminClient();
  let query = db
    .from("promocode_redemptions")
    .select("*, promocodes:promocode_id(code,name,coin_reward), profiles:user_id(full_name,email)");
  query = applyDateRange(query, params);
  const { data } = await query.order("created_at", { ascending: false }).limit(50000);
  return (data ?? []).map((r: any) => ({
    code: r.promocodes?.code || "-",
    name: r.promocodes?.name || "-",
    user: r.profiles?.full_name || r.profiles?.email || "-",
    coins: r.promocodes?.coin_reward ?? 0,
    date: r.created_at,
  }));
}

export async function getTopSellingReport(params: ListParams) {
  const db = createSupabaseAdminClient();
  let query = db.from("book_unlocks").select("book_id, books:book_id(title, book_type)");
  query = applyDateRange(query, params);
  const { data } = await query.limit(50000);
  const buckets: Record<string, any> = {};
  (data ?? []).forEach((u: any) => {
    if (!u.books) return;
    const key = u.book_id;
    buckets[key] ||= { book_name: u.books.title, book_type: u.books.book_type, count: 0 };
    buckets[key].count += 1;
  });
  return Object.values(buckets).sort((a: any, b: any) => b.count - a.count);
}

export async function getLanguageReport(params: ListParams) {
  const db = createSupabaseAdminClient();
  const { data } = await db.from("books").select("language_code, listen_count");
  const buckets: Record<string, any> = {};
  (data ?? []).forEach((b: any) => {
    const key = b.language_code || "unknown";
    buckets[key] ||= { language: key, books: 0, listens: 0 };
    buckets[key].books += 1;
    buckets[key].listens += b.listen_count || 0;
  });
  return Object.values(buckets);
}

export async function getPackageReport(params: ListParams) {
  const db = createSupabaseAdminClient();
  let query = db
    .from("transactions")
    .select("amount, coin_packages:package_id(name)")
    .eq("type", "purchase")
    .eq("payment_status", "completed");
  query = applyDateRange(query, params);
  const { data } = await query.limit(50000);
  const buckets: Record<string, any> = {};
  (data ?? []).forEach((t: any) => {
    const key = t.coin_packages?.name || "-";
    buckets[key] ||= { package_name: key, count: 0, amount: 0 };
    buckets[key].count += 1;
    buckets[key].amount += t.amount || 0;
  });
  return Object.values(buckets).sort((a: any, b: any) => b.amount - a.amount);
}
