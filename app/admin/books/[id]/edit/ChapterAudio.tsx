"use client";

import { useState, useTransition } from "react";
import { Play, Loader2, AlertCircle } from "lucide-react";
import { getChapterAudioUrlAction } from "../../actions";
import { toast } from "@/lib/toast";

export function ChapterAudio({ audioPath }: { audioPath: string | null }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!audioPath) {
    return <span className="text-xs text-muted">No audio</span>;
  }

  if (url) {
    // eslint-disable-next-line jsx-a11y/media-has-caption
    return <audio controls autoPlay src={url} className="h-9 w-56 max-w-full" />;
  }

  function load() {
    startTransition(async () => {
      const res = await getChapterAudioUrlAction(audioPath!);
      if (!res.url) {
        setFailed(true);
        toast("Audio file not found in storage", "error");
        return;
      }
      setUrl(res.url);
    });
  }

  return (
    <button
      onClick={load}
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-2.5 py-1.5 text-xs font-semibold text-brand transition hover:bg-brand-100 disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : failed ? (
        <AlertCircle className="h-3.5 w-3.5 text-red-500" />
      ) : (
        <Play className="h-3.5 w-3.5" />
      )}
      {failed ? "Not found" : "Play"}
    </button>
  );
}
