"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  saveHomeHero,
  createCarousel,
  updateCarousel,
  deleteCarousel,
  reorderCarousels,
  syncCarouselBooks,
} from "@/lib/repositories/homeScreenRepository";

const PATH = "/admin/home-screen";

export async function saveHomeHeroAction(formData: FormData) {
  await requireAdmin();
  try {
    await saveHomeHero({
      title: String(formData.get("title") || ""),
      enabled: formData.get("enabled") === "true",
      hero_title: String(formData.get("hero_title") || ""),
      hero_description: String(formData.get("hero_description") || ""),
      button_one_text: String(formData.get("button_one_text") || ""),
      button_one_link: String(formData.get("button_one_link") || ""),
      button_two_text: String(formData.get("button_two_text") || ""),
      button_two_link: String(formData.get("button_two_link") || ""),
      image_url: String(formData.get("image_url") || ""),
    });
    revalidatePath(PATH);
  } catch (e: any) {
    return { error: e.message };
  }
}

function parseCarousel(formData: FormData) {
  return {
    title: String(formData.get("title")),
    type: String(formData.get("type")),
    category_id: (formData.get("category_id") as string) || null,
    subcategory_id: (formData.get("subcategory_id") as string) || null,
    language_code: (formData.get("language_code") as string) || null,
    collection_id: (formData.get("collection_id") as string) || null,
    book_limit: Number(formData.get("book_limit") || 10),
    requires_auth: formData.get("requires_auth") === "true",
    is_active: formData.get("is_active") === "true",
  };
}

export async function createCarouselAction(formData: FormData) {
  await requireAdmin();
  try {
    const carousel = await createCarousel({ ...parseCarousel(formData), sort_order: 999 });
    const bookIds = String(formData.get("book_ids") || "").split(",").map((s) => s.trim()).filter(Boolean);
    if (bookIds.length) await syncCarouselBooks(carousel.id, bookIds);
    revalidatePath(PATH);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updateCarouselAction(id: string, formData: FormData) {
  await requireAdmin();
  try {
    await updateCarousel(id, parseCarousel(formData));
    const bookIds = String(formData.get("book_ids") || "").split(",").map((s) => s.trim()).filter(Boolean);
    await syncCarouselBooks(id, bookIds);
    revalidatePath(PATH);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteCarouselAction(id: string) {
  await requireAdmin();
  await deleteCarousel(id);
  revalidatePath(PATH);
}

export async function reorderCarouselsAction(orderedIds: string[]) {
  await requireAdmin();
  await reorderCarousels(orderedIds);
  revalidatePath(PATH);
}
