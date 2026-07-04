import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { range, type ListParams, type ListResult } from "./types";

const TABLE = "collections";

export async function listCollections(params: ListParams): Promise<ListResult<any>> {
  const db = createSupabaseAdminClient();
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 10;
  const { start, end } = range(page, perPage);

  let query = db
    .from(TABLE)
    .select("*, collection_books(book_id, sort_order, books:book_id(title))", { count: "exact" });
  if (params.q) query = query.ilike("title", `%${params.q}%`);
  query = query.order(params.sort || "created_at", { ascending: params.dir === "asc" }).range(start, end);

  const { data, count } = await query;
  return { rows: data ?? [], count: count ?? 0, page, perPage };
}

export async function getCollection(id: string) {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from(TABLE)
    .select("*, collection_books(book_id, sort_order)")
    .eq("id", id)
    .single();
  return data;
}

export async function createCollection(
  values: Record<string, unknown>,
  bookIds: string[]
) {
  const db = createSupabaseAdminClient();
  const { data, error } = await db.from(TABLE).insert(values).select().single();
  if (error) throw new Error(error.message);
  await syncCollectionBooks(data.id, bookIds);
  return data;
}

export async function updateCollection(
  id: string,
  values: Record<string, unknown>,
  bookIds: string[]
) {
  const db = createSupabaseAdminClient();
  const { error } = await db.from(TABLE).update(values).eq("id", id);
  if (error) throw new Error(error.message);
  await syncCollectionBooks(id, bookIds);
}

export async function deleteCollection(id: string) {
  const db = createSupabaseAdminClient();
  const { error } = await db.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function syncCollectionBooks(collectionId: string, bookIds: string[]) {
  const db = createSupabaseAdminClient();
  await db.from("collection_books").delete().eq("collection_id", collectionId);
  if (bookIds.length) {
    const rows = bookIds.map((bookId, index) => ({
      collection_id: collectionId,
      book_id: bookId,
      sort_order: index,
    }));
    await db.from("collection_books").insert(rows);
  }
}
