"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  approveManualPayment,
  rejectManualPayment,
} from "@/lib/repositories/paymentRepository";

const PATH = "/admin/payments/manual";

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
