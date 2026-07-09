"use client";

import * as tus from "tus-js-client";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { uploadFileToStorage } from "./upload";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

// Preferred audio upload: try resumable (TUS) for reliability with huge files;
// if the storage RLS policy isn't set yet, fall back to the standard signed upload.
export async function uploadAudio(
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  try {
    return await uploadAudioResumable(file, onProgress);
  } catch {
    onProgress?.(100);
    return await uploadFileToStorage("book-audio", file);
  }
}

// Resumable (TUS) upload — reliable for very large audio files (1-2 hours).
// Uploads the browser file directly to Supabase Storage in 6MB chunks with
// automatic retries; never passes through the Next.js server.
export async function uploadAudioResumable(
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not signed in");

  const ext = file.name.split(".").pop();
  const path = `${crypto.randomUUID()}.${ext}`;

  await new Promise<void>((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: `${SUPABASE_URL}/storage/v1/upload/resumable`,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${session.access_token}`,
        "x-upsert": "true",
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      chunkSize: 6 * 1024 * 1024,
      metadata: {
        bucketName: "book-audio",
        objectName: path,
        contentType: file.type || "audio/mpeg",
        cacheControl: "3600",
      },
      onError: (err) => reject(err),
      onProgress: (uploaded, total) => {
        if (onProgress && total) onProgress(Math.round((uploaded / total) * 100));
      },
      onSuccess: () => resolve(),
    });

    upload.findPreviousUploads().then((prev) => {
      if (prev.length) upload.resumeFromPreviousUpload(prev[0]);
      upload.start();
    });
  });

  return path;
}
