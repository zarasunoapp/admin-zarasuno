"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { createUploadUrlAction } from "@/app/upload-actions";

export async function uploadFileToStorage(
  bucket: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  const res = await createUploadUrlAction(bucket, file.name);
  if ((res as any).error) throw new Error((res as any).error);
  const { path, token, stored } = res as { path: string; token: string; stored: string };

  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.storage.from(bucket).uploadToSignedUrl(path, token, file);
  if (error) throw new Error(error.message);

  onProgress?.(100);
  return stored;
}
