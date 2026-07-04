"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  createNotification,
  deleteNotification,
} from "@/lib/repositories/notificationRepository";

const PATH = "/admin/notifications";

export async function createNotificationAction(formData: FormData) {
  await requireAdmin();
  try {
    const audience = String(formData.get("audience") || "all");
    const userId = (formData.get("user_id") as string) || null;
    await createNotification({
      title: String(formData.get("title")),
      body: (formData.get("body") as string) || null,
      audience,
      user_id: audience === "specific" ? userId : null,
      show_in_popup: formData.get("show_in_popup") === "true",
      image_url: (formData.get("image_url") as string) || null,
    });
    revalidatePath(PATH);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteNotificationAction(id: string) {
  await requireAdmin();
  await deleteNotification(id);
  revalidatePath(PATH);
}
