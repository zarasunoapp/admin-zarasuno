import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function getHomeHero() {
  const db = createSupabaseAdminClient();
  const { data } = await db.from("app_settings").select("value").eq("key", "home_hero").single();
  return data?.value ?? {};
}

export async function saveHomeHero(value: Record<string, unknown>) {
  const db = createSupabaseAdminClient();
  const { error } = await db
    .from("app_settings")
    .upsert({ key: "home_hero", value }, { onConflict: "key" });
  if (error) throw new Error(error.message);
}

export async function listCarousels() {
  const db = createSupabaseAdminClient();
  const { data } = await db.from("home_carousels").select("*").order("sort_order");
  return data ?? [];
}

export async function createCarousel(values: Record<string, unknown>) {
  const db = createSupabaseAdminClient();
  const { data, error } = await db.from("home_carousels").insert(values).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateCarousel(id: string, values: Record<string, unknown>) {
  const db = createSupabaseAdminClient();
  const { error } = await db.from("home_carousels").update(values).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteCarousel(id: string) {
  const db = createSupabaseAdminClient();
  const { error } = await db.from("home_carousels").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function reorderCarousels(orderedIds: string[]) {
  const db = createSupabaseAdminClient();
  await Promise.all(
    orderedIds.map((id, index) =>
      db.from("home_carousels").update({ sort_order: index }).eq("id", id)
    )
  );
}

export async function getCarouselBooks(carouselId: string) {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("carousel_books")
    .select("book_id, sort_order, books:book_id(title)")
    .eq("carousel_id", carouselId)
    .order("sort_order");
  return data ?? [];
}

export async function syncCarouselBooks(carouselId: string, bookIds: string[]) {
  const db = createSupabaseAdminClient();
  await db.from("carousel_books").delete().eq("carousel_id", carouselId);
  if (bookIds.length) {
    const rows = bookIds.map((bookId, index) => ({
      carousel_id: carouselId,
      book_id: bookId,
      sort_order: index,
    }));
    await db.from("carousel_books").insert(rows);
  }
}
