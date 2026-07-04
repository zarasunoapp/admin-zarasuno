import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { range, type ListParams, type ListResult } from "./types";

const TABLE = "books";
const SELECT =
  "*, authors:author_id(id,name), publishers:publisher_id(id,name), subcategories:subcategory_id(id,name,category_id)";

export async function listBooks(params: ListParams): Promise<ListResult<any>> {
  const db = createSupabaseAdminClient();
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 10;
  const { start, end } = range(page, perPage);

  let query = db.from(TABLE).select(SELECT, { count: "exact" });
  if (params.q) query = query.or(`title.ilike.%${params.q}%,subtitle.ilike.%${params.q}%`);

  switch (params.type) {
    case "summary":
    case "full":
    case "ebook":
    case "audiobook":
      query = query.eq("book_type", params.type);
      break;
    case "free":
      query = query.eq("is_free", true);
      break;
    case "premium":
      query = query.eq("is_premium", true);
      break;
  }

  query = query.order(params.sort || "created_at", { ascending: params.dir === "asc" }).range(start, end);

  const { data, count } = await query;
  return { rows: data ?? [], count: count ?? 0, page, perPage };
}

export async function getBook(id: string) {
  const db = createSupabaseAdminClient();
  const { data } = await db.from(TABLE).select(SELECT).eq("id", id).single();
  return data;
}

export async function createBook(values: Record<string, unknown>) {
  const db = createSupabaseAdminClient();
  const { data, error } = await db.from(TABLE).insert(values).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateBook(id: string, values: Record<string, unknown>) {
  const db = createSupabaseAdminClient();
  const { data, error } = await db.from(TABLE).update(values).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteBook(id: string) {
  const db = createSupabaseAdminClient();
  const { error } = await db.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function duplicateBook(id: string) {
  const db = createSupabaseAdminClient();
  const { data: original } = await db.from(TABLE).select("*").eq("id", id).single();
  if (!original) throw new Error("Book not found");
  const { id: _id, created_at, updated_at, ...rest } = original as Record<string, unknown>;
  const copy = { ...rest, title: `${original.title} (Copy)`, is_published: false };
  const { data, error } = await db.from(TABLE).insert(copy).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function toggleBookFlag(
  id: string,
  flag: "is_book_of_day" | "is_top_selling" | "is_recommended",
  value: boolean
) {
  const db = createSupabaseAdminClient();
  const { error } = await db.from(TABLE).update({ [flag]: value }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listLatestBooks(limit = 8) {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from(TABLE)
    .select("id,title,cover_url,book_type,created_at, authors:author_id(name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function listAllBooks() {
  const db = createSupabaseAdminClient();
  const { data } = await db.from(TABLE).select("id,title").order("title");
  return data ?? [];
}

export async function countBooks() {
  const db = createSupabaseAdminClient();
  const { count } = await db.from(TABLE).select("id", { count: "exact", head: true });
  return count ?? 0;
}
