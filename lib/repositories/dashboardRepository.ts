import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function monthKey(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function getDashboardStats() {
  const db = createSupabaseAdminClient();
  const [books, authors, users, sales] = await Promise.all([
    db.from("books").select("id", { count: "exact", head: true }),
    db.from("authors").select("id", { count: "exact", head: true }),
    db.from("profiles").select("id", { count: "exact", head: true }),
    db
      .from("transactions")
      .select("id", { count: "exact", head: true })
      .eq("type", "purchase")
      .eq("payment_status", "completed"),
  ]);
  return {
    totalBooks: books.count ?? 0,
    totalAuthors: authors.count ?? 0,
    totalUsers: users.count ?? 0,
    totalSales: sales.count ?? 0,
  };
}

export async function getMonthlySales() {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("transactions")
    .select("amount,created_at")
    .eq("type", "purchase")
    .eq("payment_status", "completed")
    .order("created_at");
  const buckets: Record<string, number> = {};
  (data ?? []).forEach((t: any) => {
    const key = monthKey(t.created_at);
    buckets[key] = (buckets[key] || 0) + (t.amount || 0);
  });
  return Object.entries(buckets).map(([month, value]) => ({ month, value }));
}

export async function getMonthlyNewUsers() {
  const db = createSupabaseAdminClient();
  const { data } = await db.from("profiles").select("created_at").order("created_at");
  const buckets: Record<string, number> = {};
  (data ?? []).forEach((u: any) => {
    const key = monthKey(u.created_at);
    buckets[key] = (buckets[key] || 0) + 1;
  });
  return Object.entries(buckets).map(([month, value]) => ({ month, value }));
}

export async function getSalesByProvider() {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("transactions")
    .select("payment_provider")
    .eq("type", "purchase")
    .eq("payment_status", "completed");
  const buckets: Record<string, number> = {};
  (data ?? []).forEach((t: any) => {
    const key = t.payment_provider || "unknown";
    buckets[key] = (buckets[key] || 0) + 1;
  });
  return Object.entries(buckets).map(([name, value]) => ({ name, value }));
}

export async function getUsersByCategory() {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("user_categories")
    .select("category_id, categories:category_id(name)");
  const buckets: Record<string, number> = {};
  (data ?? []).forEach((u: any) => {
    const key = u.categories?.name || "None";
    buckets[key] = (buckets[key] || 0) + 1;
  });
  return Object.entries(buckets).map(([name, value]) => ({ name, value }));
}
