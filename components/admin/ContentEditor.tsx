"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Save } from "lucide-react";
import { RichTextEditor } from "./RichTextEditor";
import { toast } from "@/lib/toast";

export function ContentEditor({
  slug,
  defaultTitle,
  defaultContent,
  action,
}: {
  slug: string;
  defaultTitle: string;
  defaultContent: string;
  action: (slug: string, formData: FormData) => Promise<{ error?: string } | void>;
}) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  function submit(formData: FormData) {
    setError("");
    setSaved(false);
    startTransition(async () => {
      const res = await action(slug, formData);
      if (res && res.error) {
        setError(res.error);
        toast(res.error, "error");
      } else {
        setSaved(true);
        toast("Page saved", "success");
        router.refresh();
      }
    });
  }

  return (
    <form action={submit} className="card space-y-4 p-6">
      <div>
        <label className="label">Title</label>
        <input name="title" defaultValue={defaultTitle} className="input" />
      </div>
      <div>
        <label className="label">Content</label>
        <RichTextEditor name="content" defaultValue={defaultContent} />
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" className="btn-primary" disabled={pending}>
          <Save className="h-4 w-4" />
          {pending ? "Saving..." : "Save"}
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1 text-sm text-brand">
            <CheckCircle2 className="h-4 w-4" /> Saved
          </span>
        )}
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
    </form>
  );
}
