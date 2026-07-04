"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function bulkDeleteAction(table: string, path: string, ids: string[]) {
  await requireAdmin();
  if (!ids.length) return;
  const db = createSupabaseAdminClient();
  const { error } = await db.from(table).delete().in("id", ids);
  if (error) return { error: error.message };
  revalidatePath(path);
}
