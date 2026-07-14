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

// Live PKR->AUD conversion using a free, keyless daily rate API (cached ~a day).
let rateCache = { pkrPerAud: 0, at: 0 };
async function getPkrPerAud(): Promise<number> {
  const now = Date.now();
  if (rateCache.pkrPerAud && now - rateCache.at < 6 * 3600 * 1000) return rateCache.pkrPerAud;
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/AUD", {
      next: { revalidate: 86400 },
    });
    const json = await res.json();
    const pkr = Number(json?.rates?.PKR);
    if (pkr > 0) {
      rateCache = { pkrPerAud: pkr, at: now };
      return pkr;
    }
  } catch {
    // ignore — fall back below
  }
  return rateCache.pkrPerAud || Number(process.env.EXCHANGE_PKR_PER_AUD || 185);
}

export async function getMonthlySales() {
  const db = createSupabaseAdminClient();
  const pkrPerAud = await getPkrPerAud();
  const toAud = (amount: any, currency: any) => {
    const a = Number(amount || 0);
    return String(currency || "").toUpperCase() === "PKR" ? a / pkrPerAud : a;
  };
  const { data } = await db
    .from("transactions")
    .select("amount,currency,created_at")
    .eq("type", "purchase")
    .eq("payment_status", "completed")
    .order("created_at");
  const buckets: Record<string, number> = {};
  (data ?? []).forEach((t: any) => {
    const key = monthKey(t.created_at);
    buckets[key] = (buckets[key] || 0) + toAud(t.amount, t.currency);
  });
  return Object.entries(buckets)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => {
      const [y, m] = key.split("-");
      const label = new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-AU", {
        month: "short",
        year: "2-digit",
      });
      return { month: label, value: Math.round(value * 100) / 100 };
    });
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
