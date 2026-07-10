"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAuthor, updateAuthor, deleteAuthor } from "@/lib/repositories/authorRepository";

const PATH = "/admin/authors";

function parse(formData: FormData) {
  return {
    name: String(formData.get("name")),
    email: (formData.get("email") as string) || null,
    country: (formData.get("country") as string) || null,
    password: (formData.get("password") as string) || null,
    bio: (formData.get("bio") as string) || null,
    avatar_url: (formData.get("avatar_url") as string) || null,
  };
}

export async function createAuthorAction(formData: FormData) {
  await requireAdmin();
  try {
    await createAuthor(parse(formData));
    revalidatePath(PATH);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updateAuthorAction(id: string, formData: FormData) {
  await requireAdmin();
  try {
    await updateAuthor(id, parse(formData));
    revalidatePath(PATH);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteAuthorAction(id: string) {
  await requireAdmin();
  await deleteAuthor(id);
  revalidatePath(PATH);
}
