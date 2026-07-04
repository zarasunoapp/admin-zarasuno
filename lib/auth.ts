import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function getSessionUser() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getAdminProfile() {
  const user = await getSessionUser();
  if (!user) return null;
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (!data || data.role !== "admin") return null;
  return { ...data, email: user.email };
}

export async function requireAdmin() {
  const profile = await getAdminProfile();
  if (!profile) redirect("/login?error=not-authorized");
  return profile;
}
