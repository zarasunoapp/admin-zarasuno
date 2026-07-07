"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  createFeaturedBook,
  updateFeaturedBook,
  deleteFeaturedBook,
} from "@/lib/repositories/featuredBookRepository";

const PATH = "/admin/featured-books";

function parse(formData: FormData) {
  return {
    book_id: (formData.get("book_id") as string) || null,
    title: String(formData.get("title") || ""),
    image_url: String(formData.get("image_url") || ""),
    sort_order: Number(formData.get("sort_order") || 0),
    is_active: formData.get("is_active") === "true",
  };
}

export async function createFeaturedBookAction(formData: FormData) {
  await requireAdmin();
  try {
    await createFeaturedBook(parse(formData));
    revalidatePath(PATH);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updateFeaturedBookAction(id: string, formData: FormData) {
  await requireAdmin();
  try {
    await updateFeaturedBook(id, parse(formData));
    revalidatePath(PATH);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteFeaturedBookAction(id: string) {
  await requireAdmin();
  await deleteFeaturedBook(id);
  revalidatePath(PATH);
}
