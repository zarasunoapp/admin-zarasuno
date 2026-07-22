import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const TABLE = "influencers";

export async function listInfluencers() {
  const db = createSupabaseAdminClient();
  const { data } = await db.from(TABLE).select("*").order("created_at", { ascending: false });
  return data ?? [];
}

export async function listAllInfluencers() {
  const db = createSupabaseAdminClient();
  const { data } = await db.from(TABLE).select("id,name").order("name");
  return data ?? [];
}

export async function createInfluencer(values: {
  name: string;
  email: string;
  password: string;
  commissionPercent?: number;
}) {
  const db = createSupabaseAdminClient();
  const email = values.email.trim().toLowerCase();
  const { data: authData, error: authErr } = await db.auth.admin.createUser({
    email,
    password: values.password,
    email_confirm: true,
  });
  if (authErr) throw new Error(authErr.message);
  const userId = authData.user.id;
  const { error: pErr } = await db
    .from("profiles")
    .upsert({ id: userId, email, full_name: values.name, role: "influencer" }, { onConflict: "id" });
  if (pErr) throw new Error(pErr.message);

  const { data, error } = await db
    .from(TABLE)
    .insert({
      name: values.name,
      email,
      user_id: userId,
      commission_percent: values.commissionPercent ?? 0,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateInfluencer(
  id: string,
  values: { name?: string; commissionPercent?: number; password?: string }
) {
  const db = createSupabaseAdminClient();
  const { data: existing } = await db.from(TABLE).select("user_id").eq("id", id).single();
  if (values.password && existing?.user_id) {
    const { error } = await db.auth.admin.updateUserById(existing.user_id, { password: values.password });
    if (error) throw new Error(error.message);
  }
  const patch: Record<string, unknown> = {};
  if (values.name != null) patch.name = values.name;
  if (values.commissionPercent != null) patch.commission_percent = values.commissionPercent;
  if (Object.keys(patch).length) {
    const { error } = await db.from(TABLE).update(patch).eq("id", id);
    if (error) throw new Error(error.message);
  }
}

export async function deleteInfluencer(id: string) {
  const db = createSupabaseAdminClient();
  const { data: existing } = await db.from(TABLE).select("user_id").eq("id", id).single();
  if (existing?.user_id) await db.auth.admin.deleteUser(existing.user_id).catch(() => null);
  const { error } = await db.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
}
