"use client";

import { useState } from "react";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";
import { uploadFileToStorage } from "./upload";

export function FileUploader({
  bucket,
  name,
  defaultValue = "",
  accept,
  label = "Upload File",
  onUploaded,
}: {
  bucket: string;
  name: string;
  defaultValue?: string;
  accept?: string;
  label?: string;
  onUploaded?: (value: string) => void;
}) {
  const [value, setValue] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const isImage = /\.(png|jpe?g|gif|webp|svg|avif)(\?|$)/i.test(value) || value.startsWith("data:image");

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const stored = await uploadFileToStorage(bucket, file);
      setValue(stored);
      onUploaded?.(stored);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/10 bg-ivory/50 px-4 py-5 text-sm font-medium text-muted transition hover:border-brand hover:text-brand">
        {busy ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : value ? (
          <CheckCircle2 className="h-5 w-5 text-brand" />
        ) : (
          <Upload className="h-5 w-5" />
        )}
        {busy ? "Uploading..." : value ? "Uploaded — replace?" : label}
        <input type="file" accept={accept} className="hidden" onChange={handle} />
      </label>
      <input type="hidden" name={name} value={value} />
      {value && !busy && isImage && (
        <div className="mt-2 flex items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-black/10 bg-white p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="preview" className="h-full w-full object-contain" />
          </div>
          <p className="min-w-0 flex-1 truncate text-xs text-muted">{value}</p>
        </div>
      )}
      {value && !busy && !isImage && <p className="mt-1.5 truncate text-xs text-muted">{value}</p>}
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}
