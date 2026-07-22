"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  createInfluencer,
  updateInfluencer,
  deleteInfluencer,
} from "@/lib/repositories/influencerRepository";

const PATH = "/admin/influencers";

export async function createInfluencerAction(formData: FormData) {
  await requireAdmin();
  try {
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    if (!email || password.length < 6) return { error: "Email and a 6+ char password are required" };
    await createInfluencer({
      name: String(formData.get("name") || ""),
      email,
      password,
      commissionPercent: Number(formData.get("commission_percent") || 0),
    });
    revalidatePath(PATH);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updateInfluencerAction(id: string, formData: FormData) {
  await requireAdmin();
  try {
    const password = String(formData.get("password") || "");
    await updateInfluencer(id, {
      name: (formData.get("name") as string) ?? undefined,
      commissionPercent: formData.get("commission_percent") != null ? Number(formData.get("commission_percent")) : undefined,
      password: password || undefined,
    });
    revalidatePath(PATH);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteInfluencerAction(id: string) {
  await requireAdmin();
  await deleteInfluencer(id);
  revalidatePath(PATH);
}
