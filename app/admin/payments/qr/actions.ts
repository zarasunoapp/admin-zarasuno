"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  createPaymentConfig,
  updatePaymentConfig,
  deletePaymentConfig,
} from "@/lib/repositories/paymentRepository";

const PATH = "/admin/payments/qr";

function parse(formData: FormData) {
  return {
    provider: String(formData.get("provider") || "jazzcash"),
    country: String(formData.get("country") || "PK"),
    display_name: String(formData.get("display_name") || ""),
    account_details: String(formData.get("account_details") || ""),
    description: String(formData.get("description") || ""),
    qr_code_url: String(formData.get("qr_code_url") || ""),
    is_active: formData.get("is_active") === "true",
    sort_order: Number(formData.get("sort_order") || 0),
  };
}

export async function createPaymentConfigAction(formData: FormData) {
  await requireAdmin();
  try {
    const values = parse(formData);
    if (!values.display_name) return { error: "Display name is required" };
    await createPaymentConfig(values);
    revalidatePath(PATH);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updatePaymentConfigAction(id: string, formData: FormData) {
  await requireAdmin();
  try {
    const values = parse(formData);
    if (!values.display_name) return { error: "Display name is required" };
    await updatePaymentConfig(id, values);
    revalidatePath(PATH);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deletePaymentConfigAction(id: string) {
  await requireAdmin();
  await deletePaymentConfig(id);
  revalidatePath(PATH);
}
