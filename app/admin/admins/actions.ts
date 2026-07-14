"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth";
import { createAdmin, updateAdmin, deleteAdmin } from "@/lib/repositories/adminRepository";

const PATH = "/admin/admins";

export async function createAdminAction(formData: FormData) {
  await requireSuperAdmin();
  try {
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    if (!email || password.length < 6) return { error: "Email and a 6+ char password are required" };
    await createAdmin({ email, password, fullName: (formData.get("full_name") as string) || undefined });
    revalidatePath(PATH);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updateAdminAction(id: string, formData: FormData) {
  await requireSuperAdmin();
  try {
    const password = String(formData.get("password") || "");
    await updateAdmin(id, {
      fullName: (formData.get("full_name") as string) ?? undefined,
      password: password ? password : undefined,
    });
    revalidatePath(PATH);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteAdminAction(id: string) {
  await requireSuperAdmin();
  await deleteAdmin(id);
  revalidatePath(PATH);
}
