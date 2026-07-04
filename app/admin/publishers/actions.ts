"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  createPublisher,
  updatePublisher,
  deletePublisher,
  bulkInsertPublishers,
} from "@/lib/repositories/publisherRepository";

export async function createPublisherAction(formData: FormData) {
  await requireAdmin();
  try {
    await createPublisher({
      name: String(formData.get("name")),
      email: (formData.get("email") as string) || null,
    });
    revalidatePath("/admin/publishers");
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updatePublisherAction(id: string, formData: FormData) {
  await requireAdmin();
  try {
    await updatePublisher(id, {
      name: String(formData.get("name")),
      email: (formData.get("email") as string) || null,
    });
    revalidatePath("/admin/publishers");
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deletePublisherAction(id: string) {
  await requireAdmin();
  await deletePublisher(id);
  revalidatePath("/admin/publishers");
}

export async function importPublishersAction(rows: { name: string; email?: string | null }[]) {
  await requireAdmin();
  try {
    await bulkInsertPublishers(rows);
    revalidatePath("/admin/publishers");
  } catch (e: any) {
    return { error: e.message };
  }
}
