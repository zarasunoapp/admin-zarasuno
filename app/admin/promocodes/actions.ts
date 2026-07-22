"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  createPromocode,
  updatePromocode,
  deletePromocode,
} from "@/lib/repositories/promocodeRepository";
import { notifyBroadcast } from "@/lib/repositories/notificationRepository";

const PATH = "/admin/promocodes";

function parse(formData: FormData) {
  const rewardType = (formData.get("reward_type") as string) || "coins";
  return {
    name: String(formData.get("name")),
    code: String(formData.get("code")).toUpperCase(),
    reward_type: rewardType,
    coin_reward: rewardType === "coins" ? Number(formData.get("coin_reward") || 0) : 0,
    discount_percent:
      rewardType === "discount" ? Number(formData.get("discount_percent") || 0) : null,
    package_id: (formData.get("package_id") as string) || null,
    influencer_id: (formData.get("influencer_id") as string) || null,
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
    const values = parse(formData);
    await createPromocode(values);
    if (values.is_active) {
      if (values.reward_type === "discount") {
        await notifyBroadcast(
          `🎉 ${values.discount_percent}% OFF on coin packages!`,
          `Use code ${values.code} at checkout and save on your next coin purchase.`
        );
      } else if (values.coin_reward > 0) {
        await notifyBroadcast(
          `🎁 Free ${values.coin_reward} coins!`,
          `Redeem code ${values.code} to get ${values.coin_reward} free coins on ZaraSuno.`
        );
      }
    }
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
