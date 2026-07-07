"use server";

import { requireAdmin } from "@/lib/auth";
import { createSignedUpload } from "@/lib/repositories/storageRepository";

export async function createUploadUrlAction(bucket: string, filename: string, prefix = "") {
  await requireAdmin();
  try {
    return await createSignedUpload(bucket, filename, prefix);
  } catch (e: any) {
    return { error: e.message as string };
  }
}
