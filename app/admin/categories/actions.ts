"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  setCategoryActive,
} from "@/lib/repositories/categoryRepository";

const PATH = "/admin/categories";

function parse(formData: FormData) {
  const name = String(formData.get("name"));
  return {
    name,
    slug: (formData.get("slug") as string) || slugify(name),
    icon_url: (formData.get("icon_url") as string) || null,
    sort_order: Number(formData.get("sort_order") || 0),
    is_active: formData.get("is_active") === "true",
  };
}

export async function createCategoryAction(formData: FormData) {
  await requireAdmin();
  try {
    await createCategory(parse(formData));
    revalidatePath(PATH);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updateCategoryAction(id: string, formData: FormData) {
  await requireAdmin();
  try {
    await updateCategory(id, parse(formData));
    revalidatePath(PATH);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteCategoryAction(id: string) {
  await requireAdmin();
  await deleteCategory(id);
  revalidatePath(PATH);
}

export async function toggleCategoryAction(id: string, value: boolean) {
  await requireAdmin();
  await setCategoryActive(id, value);
  revalidatePath(PATH);
}
