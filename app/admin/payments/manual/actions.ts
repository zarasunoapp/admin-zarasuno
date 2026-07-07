"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  approveManualPayment,
  rejectManualPayment,
  createManualPayment,
} from "@/lib/repositories/paymentRepository";

const PATH = "/admin/payments/manual";

export async function addManualPaymentAction(formData: FormData) {
  await requireAdmin();
  try {
    await createManualPayment({
      userIdentifier: String(formData.get("user_identifier") || ""),
      packageId: String(formData.get("package_id") || ""),
      provider: String(formData.get("provider") || "manual"),
      reference: (formData.get("payment_reference") as string) || null,
      proofUrl: (formData.get("payment_proof_url") as string) || null,
    });
    revalidatePath(PATH);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function approvePaymentAction(id: string) {
  await requireAdmin();
  await approveManualPayment(id);
  revalidatePath(PATH);
}

export async function rejectPaymentAction(id: string) {
  await requireAdmin();
  await rejectManualPayment(id);
  revalidatePath(PATH);
}
