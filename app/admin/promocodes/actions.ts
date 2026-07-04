"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  createPromocode,
  updatePromocode,
  deletePromocode,
} from "@/lib/repositories/promocodeRepository";

const PATH = "/admin/promocodes";

function parse(formData: FormData) {
  return {
    name: String(formData.get("name")),
    code: String(formData.get("code")).toUpperCase(),
    coin_reward: Number(formData.get("coin_reward") || 0),
    starts_at: (formData.get("starts_at") as string) || null,
    expires_at: (formData.get("expires_at") as string) || null,
    max_uses: formData.get("max_uses") ? Number(formData.get("max_uses")) : null,
    per_user_limit: formData.get("per_user_limit") ? Number(formData.get("per_user_limit")) : null,
    is_active: formData.get("is_active") === "true",
  };
}

export async function createPromocodeAction(formData: FormData) {
  await requireAdmin();
  try {
    await createPromocode(parse(formData));
    revalidatePath(PATH);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updatePromocodeAction(id: string, formData: FormData) {
  await requireAdmin();
  try {
    await updatePromocode(id, parse(formData));
    revalidatePath(PATH);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deletePromocodeAction(id: string) {
  await requireAdmin();
  await deletePromocode(id);
  revalidatePath(PATH);
}
