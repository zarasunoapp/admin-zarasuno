import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const TABLE = "app_settings";

export async function getAllSettings() {
  const db = createSupabaseAdminClient();
  const { data } = await db.from(TABLE).select("key,value");
  const map: Record<string, any> = {};
  (data ?? []).forEach((row: any) => {
    map[row.key] = row.value;
  });
  return map;
}

export async function getSetting(key: string) {
  const db = createSupabaseAdminClient();
  const { data } = await db.from(TABLE).select("value").eq("key", key).single();
  return data?.value ?? null;
}

export async function saveSetting(key: string, value: unknown) {
  const db = createSupabaseAdminClient();
  const { error } = await db.from(TABLE).upsert({ key, value }, { onConflict: "key" });
  if (error) throw new Error(error.message);
}

export async function saveSettings(entries: Record<string, unknown>) {
  const db = createSupabaseAdminClient();
  const rows = Object.entries(entries).map(([key, value]) => ({ key, value }));
  const { error } = await db.from(TABLE).upsert(rows, { onConflict: "key" });
  if (error) throw new Error(error.message);
}
