import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const PRIVATE_BUCKETS = new Set(["book-audio"]);

export async function uploadFile(bucket: string, file: File, prefix = "") {
  const db = createSupabaseAdminClient();
  const ext = file.name.split(".").pop();
  const path = `${prefix}${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await db.storage
    .from(bucket)
    .upload(path, buffer, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);

  if (PRIVATE_BUCKETS.has(bucket)) return { path, url: null };
  const { data } = db.storage.from(bucket).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

export async function removeFile(bucket: string, path: string) {
  const db = createSupabaseAdminClient();
  await db.storage.from(bucket).remove([path]);
}

export async function signedAudioUrl(path: string, expiresIn = 3600) {
  const db = createSupabaseAdminClient();
  const { data } = await db.storage.from("book-audio").createSignedUrl(path, expiresIn);
  return data?.signedUrl ?? null;
}
