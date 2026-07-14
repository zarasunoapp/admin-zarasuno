import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function listAdmins() {
  const db = createSupabaseAdminClient();
  const { data } = await db
    .from("profiles")
    .select("id,email,full_name,role,created_at")
    .in("role", ["admin", "superadmin"])
    .order("role", { ascending: false })
    .order("created_at", { ascending: true });
  return data ?? [];
}

export async function createAdmin(values: { email: string; password: string; fullName?: string }) {
  const db = createSupabaseAdminClient();
  const { data, error } = await db.auth.admin.createUser({
    email: values.email.trim().toLowerCase(),
    password: values.password,
    email_confirm: true,
  });
  if (error) throw new Error(error.message);
  const id = data.user.id;
  const { error: pErr } = await db
    .from("profiles")
    .upsert(
      { id, email: values.email.trim().toLowerCase(), full_name: values.fullName || "Admin", role: "admin" },
      { onConflict: "id" }
    );
  if (pErr) throw new Error(pErr.message);
  return data.user;
}

export async function updateAdmin(id: string, values: { fullName?: string; password?: string }) {
  const db = createSupabaseAdminClient();
  if (values.password) {
    const { error } = await db.auth.admin.updateUserById(id, { password: values.password });
    if (error) throw new Error(error.message);
  }
  if (values.fullName != null) {
    const { error } = await db.from("profiles").update({ full_name: values.fullName }).eq("id", id);
    if (error) throw new Error(error.message);
  }
}

export async function deleteAdmin(id: string) {
  const db = createSupabaseAdminClient();
  const { data: target } = await db.from("profiles").select("role").eq("id", id).single();
  if (target?.role === "superadmin") throw new Error("The super admin cannot be deleted");
  await db.auth.admin.deleteUser(id).catch(() => null);
  const { error } = await db.from("profiles").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
