"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  createCollection,
  updateCollection,
  deleteCollection,
} from "@/lib/repositories/collectionRepository";

const PATH = "/admin/collections";

function parse(formData: FormData) {
  const bookIds = String(formData.get("book_ids") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const values = {
    title: String(formData.get("title")),
    status: (formData.get("status") as string) || "active",
    description: (formData.get("description") as string) || null,
    image_url: (formData.get("image_url") as string) || null,
    country_include: splitArray(formData.get("country_include")),
    country_exclude: splitArray(formData.get("country_exclude")),
  };
  return { values, bookIds };
}

function splitArray(value: FormDataEntryValue | null) {
  return String(value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function createCollectionAction(formData: FormData) {
  await requireAdmin();
  try {
    const { values, bookIds } = parse(formData);
    await createCollection(values, bookIds);
    revalidatePath(PATH);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updateCollectionAction(id: string, formData: FormData) {
  await requireAdmin();
  try {
    const { values, bookIds } = parse(formData);
    await updateCollection(id, values, bookIds);
    revalidatePath(PATH);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteCollectionAction(id: string) {
  await requireAdmin();
  await deleteCollection(id);
  revalidatePath(PATH);
}
