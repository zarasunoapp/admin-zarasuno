"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { saveContentPage } from "@/lib/repositories/contentPageRepository";

export async function saveContentPageAction(slug: string, formData: FormData) {
  await requireAdmin();
  try {
    await saveContentPage(slug, {
      title: (formData.get("title") as string) || undefined,
      body: String(formData.get("content") || ""),
    });
    revalidatePath(`/admin/${slug === "privacy" ? "privacy" : "terms"}`);
  } catch (e: any) {
    return { error: e.message };
  }
}
