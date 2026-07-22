import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { range, type ListParams, type ListResult } from "./types";

const TABLE = "publishers";

export async function listPublishers(params: ListParams): Promise<ListResult<any>> {
  const db = createSupabaseAdminClient();
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 10;
  const { start, end } = range(page, perPage);

  let query = db.from(TABLE).select("*", { count: "exact" });
  if (params.q) query = query.or(`name.ilike.%${params.q}%,email.ilike.%${params.q}%`);
  query = query.order(params.sort || "name", { ascending: params.dir !== "desc" }).range(start, end);

  const { data, count } = await query;
  return { rows: data ?? [], count: count ?? 0, page, perPage };
}

export async function getPublisher(id: string) {
  const db = createSupabaseAdminClient();
  const { data } = await db.from(TABLE).select("*").eq("id", id).single();
  return data;
}

export async function createPublisher(values: {
  name: string;
  email?: string | null;
  country?: string | null;
  password?: string | null;
}) {
  const db = createSupabaseAdminClient();
  let userId: string | null = null;

  // If email + password given, create a login account (role 'publisher') for the portal.
  if (values.email && values.password) {
    const email = values.email.trim().toLowerCase();
    const { data: authData, error: authErr } = await db.auth.admin.createUser({
      email,
      password: values.password,
      email_confirm: true,
    });
    if (authErr) throw new Error(authErr.message);
    userId = authData.user.id;
    const { error: pErr } = await db
      .from("profiles")
      .upsert({ id: userId, email, full_name: values.name, role: "publisher" }, { onConflict: "id" });
    if (pErr) throw new Error(pErr.message);
  }

  const { data, error } = await db
    .from(TABLE)
    .insert({
      name: values.name,
      email: values.email ? values.email.trim().toLowerCase() : null,
      country: values.country || null,
      user_id: userId,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updatePublisher(
  id: string,
  values: { name?: string; email?: string | null; country?: string | null; password?: string | null }
) {
  const db = createSupabaseAdminClient();
  const { data: existing } = await db.from(TABLE).select("user_id").eq("id", id).single();
  let userId: string | null = existing?.user_id || null;
  const email = values.email ? values.email.trim().toLowerCase() : null;

  if (values.password) {
    if (userId) {
      // reset existing login password
      const { error } = await db.auth.admin.updateUserById(userId, { password: values.password });
      if (error) throw new Error(error.message);
    } else if (email) {
      // no login yet — create one now
      const { data: authData, error: authErr } = await db.auth.admin.createUser({
        email,
        password: values.password,
        email_confirm: true,
      });
      if (authErr) throw new Error(authErr.message);
      userId = authData.user.id;
      const { error: pErr } = await db
        .from("profiles")
        .upsert({ id: userId, email, full_name: values.name, role: "publisher" }, { onConflict: "id" });
      if (pErr) throw new Error(pErr.message);
    }
  }

  const { data, error } = await db
    .from(TABLE)
    .update({ name: values.name, email, country: values.country || null, user_id: userId })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deletePublisher(id: string) {
  const db = createSupabaseAdminClient();
  const { data: existing } = await db.from(TABLE).select("user_id").eq("id", id).single();
  if (existing?.user_id) await db.auth.admin.deleteUser(existing.user_id).catch(() => null);
  const { error } = await db.from(TABLE).delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function bulkInsertPublishers(rows: { name: string; email?: string | null }[]) {
  const db = createSupabaseAdminClient();
  const { data, error } = await db.from(TABLE).insert(rows).select();
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listAllPublishers() {
  const db = createSupabaseAdminClient();
  const { data } = await db.from(TABLE).select("id,name").order("name");
  return data ?? [];
}
