"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { saveSettings } from "@/lib/repositories/settingsRepository";

export async function saveSettingsAction(formData: FormData) {
  await requireAdmin();
  try {
    await saveSettings({
      brand_name: String(formData.get("brand_name") || ""),
      logo_url: String(formData.get("logo_url") || ""),
      accent_color: String(formData.get("accent_color") || ""),
      primary_color: String(formData.get("primary_color") || ""),
      signup_free_coins: Number(formData.get("signup_free_coins") || 0),
      contact_email: String(formData.get("contact_email") || ""),
      socials: {
        facebook: String(formData.get("facebook") || ""),
        instagram: String(formData.get("instagram") || ""),
        twitter: String(formData.get("twitter") || ""),
        tiktok: String(formData.get("tiktok") || ""),
      },
    });
    revalidatePath("/admin/settings");
  } catch (e: any) {
    return { error: e.message };
  }
}
