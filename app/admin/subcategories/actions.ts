"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import {
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from "@/lib/repositories/subcategoryRepository";

const PATH = "/admin/subcategories";

function parse(formData: FormData) {
  const name = String(formData.get("name"));
  return {
    name,
    slug: (formData.get("slug") as string) || slugify(name),
    category_id: String(formData.get("category_id")),
    sort_order: Number(formData.get("sort_order") || 0),
  };
}

export async function createSubcategoryAction(formData: FormData) {
  await requireAdmin();
  try {
    await createSubcategory(parse(formData));
    revalidatePath(PATH);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updateSubcategoryAction(id: string, formData: FormData) {
  await requireAdmin();
  try {
    await updateSubcategory(id, parse(formData));
    revalidatePath(PATH);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteSubcategoryAction(id: string) {
  await requireAdmin();
  await deleteSubcategory(id);
  revalidatePath(PATH);
}
