"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  setUserStatus,
  setUserRole,
  deleteUser,
  grantCoins,
  grantBookAccess,
  getUserTransactions,
} from "@/lib/repositories/userRepository";

const PATH = "/admin/users";

export async function setUserStatusAction(id: string, status: string) {
  await requireAdmin();
  await setUserStatus(id, status);
  revalidatePath(PATH);
}

export async function setUserRoleAction(id: string, role: string) {
  await requireAdmin();
  await setUserRole(id, role);
  revalidatePath(PATH);
}

export async function deleteUserAction(id: string) {
  await requireAdmin();
  await deleteUser(id);
  revalidatePath(PATH);
}

export async function grantCoinsAction(userId: string, formData: FormData) {
  await requireAdmin();
  try {
    const amount = Number(formData.get("amount") || 0);
    const note = (formData.get("note") as string) || undefined;
    if (!amount) return { error: "Amount is required" };
    await grantCoins(userId, amount, note);
    revalidatePath(PATH);
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function grantBookAccessAction(userId: string, bookId: string) {
  await requireAdmin();
  await grantBookAccess(userId, bookId);
  revalidatePath(`/admin/users/${userId}`);
}

export async function fetchUserTransactionsAction(userId: string) {
  await requireAdmin();
  return getUserTransactions(userId);
}
