import "server-only";
import { getSetting, saveSetting } from "./settingsRepository";

const KEY = "featured_books";

export async function listFeaturedBooks() {
  const value = await getSetting(KEY);
  return Array.isArray(value) ? value : [];
}

export async function createFeaturedBook(item: Record<string, unknown>) {
  const list = await listFeaturedBooks();
  const record = { ...item, id: crypto.randomUUID() };
  await saveSetting(KEY, [...list, record]);
  return record;
}

export async function updateFeaturedBook(id: string, patch: Record<string, unknown>) {
  const list = await listFeaturedBooks();
  await saveSetting(
    KEY,
    list.map((f: any) => (f.id === id ? { ...f, ...patch } : f))
  );
}

export async function deleteFeaturedBook(id: string) {
  const list = await listFeaturedBooks();
  await saveSetting(
    KEY,
    list.filter((f: any) => f.id !== id)
  );
}
