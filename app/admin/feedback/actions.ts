"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { setFeedbackStatus, deleteFeedback } from "@/lib/repositories/feedbackRepository";

const PATH = "/admin/feedback";

export async function setFeedbackStatusAction(id: string, status: string) {
  await requireAdmin();
  await setFeedbackStatus(id, status);
  revalidatePath(PATH);
}

export async function deleteFeedbackAction(id: string) {
  await requireAdmin();
  await deleteFeedback(id);
  revalidatePath(PATH);
}
