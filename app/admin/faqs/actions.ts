"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createFaq, updateFaq, deleteFaq } from "@/lib/repositories/faqRepository";

const PATH = "/admin/faqs";

function parse(formData: FormData) {
  return {
    question: String(formData.get("question")),
    answer: String(formData.get("answer")),
    sort_order: Number(formData.get("sort_order") || 0),
    is_active: formData.get("is_active") === "true",
  };
}

export async function createFaqAction(formData: FormData) {
  await requireAdmin();
  try {
    await createFaq(parse(formData));
    revalidatePath(PATH);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updateFaqAction(id: string, formData: FormData) {
  await requireAdmin();
  try {
    await updateFaq(id, parse(formData));
    revalidatePath(PATH);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteFaqAction(id: string) {
  await requireAdmin();
  await deleteFaq(id);
  revalidatePath(PATH);
}
