"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  createHeroFeature,
  updateHeroFeature,
  deleteHeroFeature,
} from "@/lib/repositories/heroFeatureRepository";

const PATH = "/admin/hero-feature";

function parse(formData: FormData) {
  return {
    book_id: (formData.get("book_id") as string) || null,
    sample_audio_url: String(formData.get("sample_audio_url") || ""),
    sample_label: (formData.get("sample_label") as string) || "Free 1-min sample",
    is_active: formData.get("is_active") === "true",
    sort_order: Number(formData.get("sort_order") || 0),
  };
}

export async function createHeroFeatureAction(formData: FormData) {
  await requireAdmin();
  try {
    const values = parse(formData);
    if (!values.book_id) return { error: "Please select a book" };
    await createHeroFeature(values);
    revalidatePath(PATH);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updateHeroFeatureAction(id: string, formData: FormData) {
  await requireAdmin();
  try {
    const values = parse(formData);
    if (!values.book_id) return { error: "Please select a book" };
    await updateHeroFeature(id, values);
    revalidatePath(PATH);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteHeroFeatureAction(id: string) {
  await requireAdmin();
  await deleteHeroFeature(id);
  revalidatePath(PATH);
}
