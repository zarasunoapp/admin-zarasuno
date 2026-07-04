"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  createCoinPackage,
  updateCoinPackage,
  deleteCoinPackage,
} from "@/lib/repositories/coinPackageRepository";

const PATH = "/admin/product-coins";

function parse(formData: FormData) {
  return {
    name: String(formData.get("name")),
    price: Number(formData.get("price") || 0),
    coin_amount: Number(formData.get("coin_amount") || 0),
    bundle_id: (formData.get("bundle_id") as string) || null,
    status: (formData.get("status") as string) || "active",
    description: (formData.get("description") as string) || null,
  };
}

export async function createCoinPackageAction(formData: FormData) {
  await requireAdmin();
  try {
    await createCoinPackage(parse(formData));
    revalidatePath(PATH);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updateCoinPackageAction(id: string, formData: FormData) {
  await requireAdmin();
  try {
    await updateCoinPackage(id, parse(formData));
    revalidatePath(PATH);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteCoinPackageAction(id: string) {
  await requireAdmin();
  await deleteCoinPackage(id);
  revalidatePath(PATH);
}
