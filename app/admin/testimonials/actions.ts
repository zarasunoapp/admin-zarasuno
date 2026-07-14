"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "@/lib/repositories/testimonialRepository";

const PATH = "/admin/testimonials";

function parse(formData: FormData) {
  return {
    name: String(formData.get("name") || ""),
    title: (formData.get("title") as string) || null,
    message: String(formData.get("message") || ""),
    rating: Number(formData.get("rating") || 5),
    avatar_url: (formData.get("avatar_url") as string) || null,
    sort_order: Number(formData.get("sort_order") || 0),
    is_active: formData.get("is_active") === "true",
  };
}

export async function createTestimonialAction(formData: FormData) {
  await requireAdmin();
  try {
    await createTestimonial(parse(formData));
    revalidatePath(PATH);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updateTestimonialAction(id: string, formData: FormData) {
  await requireAdmin();
  try {
    await updateTestimonial(id, parse(formData));
    revalidatePath(PATH);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteTestimonialAction(id: string) {
  await requireAdmin();
  await deleteTestimonial(id);
  revalidatePath(PATH);
}
