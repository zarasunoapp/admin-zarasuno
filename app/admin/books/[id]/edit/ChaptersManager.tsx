"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, GripVertical, Trash2, Loader2, CheckCircle2, X, Plus, Pencil, Clock, FileText } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { FileUploader } from "@/components/admin/FileUploader";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { uploadAudio } from "@/components/admin/resumableUpload";
import { ChapterAudio } from "./ChapterAudio";
import {
  createTextChapterAction,
  bulkCreateChaptersAction,
  updateChapterAction,
  renameChapterAction,
  deleteChapterAction,
  reorderChaptersAction,
} from "../../actions";

type Staged = {
  key: string;
  title: string;
  duration: number;
  isPreview: boolean;
  audioPath: string | null;
  status: "uploading" | "done" | "error";
  progress: number;
  error?: string;
};

function detectDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const audio = document.createElement("audio");
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      resolve(Math.round(audio.duration || 0));
      URL.revokeObjectURL(audio.src);
    };
    audio.onerror = () => resolve(0);
    audio.src = URL.createObjectURL(file);
  });
}

function mmss(s: number) {
  return `${Math.floor(s / 60)}:${String(Math.round(s) % 60).padStart(2, "0")}`;
}

function totalLength(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.round(s % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

export function ChaptersManager({ bookId, chapters }: { bookId: string; chapters: any[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [items, setItems] = useState(chapters);
  const [staged, setStaged] = useState<Staged[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [editError, setEditError] = useState("");
  const [addingText, setAddingText] = useState(false);
  const [textError, setTextError] = useState("");
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [stagedDrag, setStagedDrag] = useState<number | null>(null);
  const [stagedOver, setStagedOver] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dragY = useRef(0);

  function onStagedDrop(index: number) {
    if (stagedDrag === null || stagedDrag === index) {
      setStagedDrag(null);
      setStagedOver(null);
      return;
    }
    setStaged((prev) => {
      const next = [...prev];
      const [moved] = next.splice(stagedDrag, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setStagedDrag(null);
    setStagedOver(null);
  }

  useEffect(() => {
    setItems(chapters);
  }, [chapters]);

  // Auto-scroll the window while dragging near the top/bottom edge
  useEffect(() => {
    if (dragIndex === null) return;
    let raf = 0;
    const onDragOver = (e: DragEvent) => {
      dragY.current = e.clientY;
      e.preventDefault();
    };
    window.addEventListener("dragover", onDragOver);
    const tick = () => {
      const y = dragY.current;
      const h = window.innerHeight;
      const edge = 110;
      if (y > 0 && y < edge) window.scrollBy(0, -Math.ceil((edge - y) / 5));
      else if (y > h - edge) window.scrollBy(0, Math.ceil((y - (h - edge)) / 5));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("dragover", onDragOver);
      cancelAnimationFrame(raf);
    };
  }, [dragIndex]);

  const totalSeconds =
    items.reduce((sum, c) => sum + (c.duration_seconds || 0), 0) +
    staged.reduce((sum, s) => sum + (s.duration || 0), 0);

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newItems: Staged[] = files.map((f) => ({
      key: crypto.randomUUID(),
      title: f.name.replace(/\.[^.]+$/, ""),
      duration: 0,
      isPreview: false,
      audioPath: null,
      status: "uploading",
      progress: 0,
    }));
    setStaged((prev) => [...prev, ...newItems]);
    if (fileRef.current) fileRef.current.value = "";

    await Promise.all(
      files.map(async (file, i) => {
        const key = newItems[i].key;
        const duration = await detectDuration(file);
        setStaged((prev) => prev.map((s) => (s.key === key ? { ...s, duration } : s)));
        try {
          const stored = await uploadAudio(file, (pct) =>
            setStaged((prev) => prev.map((s) => (s.key === key ? { ...s, progress: pct } : s)))
          );
          setStaged((prev) =>
            prev.map((s) => (s.key === key ? { ...s, audioPath: stored, status: "done", progress: 100 } : s))
          );
        } catch (err: any) {
          setStaged((prev) =>
            prev.map((s) => (s.key === key ? { ...s, status: "error", error: err.message } : s))
          );
        }
      })
    );
  }

  function patchStaged(key: string, patch: Partial<Staged>) {
    setStaged((prev) => prev.map((s) => (s.key === key ? { ...s, ...patch } : s)));
  }

  function removeStaged(key: string) {
    setStaged((prev) => prev.filter((s) => s.key !== key));
  }

  function saveStaged() {
    const ready = staged.filter((s) => s.status === "done");
    if (!ready.length) return;
    startTransition(async () => {
      await bulkCreateChaptersAction(
        bookId,
        ready.map((s) => ({
          title: s.title || "Untitled",
          audio_path: s.audioPath,
          duration_seconds: s.duration,
          is_preview: s.isPreview,
        }))
      );
      setStaged([]);
      router.refresh();
    });
  }

  function saveTextChapter(formData: FormData) {
    setTextError("");
    startTransition(async () => {
      const res = await createTextChapterAction(bookId, formData);
      if (res && res.error) setTextError(res.error);
      else {
        setAddingText(false);
        router.refresh();
      }
    });
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((c) => c.id !== id)); // optimistic
    startTransition(async () => {
      await deleteChapterAction(id, bookId);
      router.refresh();
    });
  }

  function saveEdit(formData: FormData) {
    setEditError("");
    startTransition(async () => {
      const res = await updateChapterAction(editing.id, bookId, formData);
      if (res && res.error) setEditError(res.error);
      else {
        setEditing(null);
        router.refresh();
      }
    });
  }

  function commitRename(id: string) {
    const title = renameDraft.trim() || "Untitled";
    setItems((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c))); // optimistic
    setRenameId(null);
    startTransition(async () => {
      await renameChapterAction(id, bookId, title);
      router.refresh();
    });
  }

  function persistOrder(next: any[]) {
    setItems(next);
    startTransition(async () => {
      await reorderChaptersAction(bookId, next.map((c) => c.id));
      router.refresh();
    });
  }

  function onDrop(index: number) {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    const next = [...items];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    setDragIndex(null);
    setOverIndex(null);
    persistOrder(next);
  }

  const uploading = staged.some((s) => s.status === "uploading");
  const readyCount = staged.filter((s) => s.status === "done").length;

  return (
    <div className="card p-6" id="chapters">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-bold text-ink">Chapters</h3>
          <p className="text-xs text-muted">Double-click a name to rename · drag rows to reorder</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700">
            <Clock className="h-3.5 w-3.5" />
            {items.length + staged.length} chapters · {totalLength(totalSeconds)}
          </span>
          <button className="btn-ghost" onClick={() => { setTextError(""); setAddingText(true); }} disabled={pending}>
            <FileText className="h-4 w-4" /> Add Text Chapter
          </button>
          <button className="btn-primary" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" /> Import Audio Files
          </button>
          <input ref={fileRef} type="file" accept="audio/*" multiple className="hidden" onChange={onFiles} />
        </div>
      </div>

      {staged.length > 0 && (
        <div className="mb-5 rounded-xl border border-brand-100 bg-brand-50/40 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-brand-700">
              {staged.length} file{staged.length > 1 ? "s" : ""} to import
              {uploading && " · uploading..."}
            </span>
            <div className="flex items-center gap-2">
              <button className="btn-ghost py-1.5" onClick={() => setStaged([])}>
                Clear
              </button>
              <button
                className="btn-primary py-1.5"
                onClick={saveStaged}
                disabled={pending || uploading || readyCount === 0}
              >
                {pending ? "Saving..." : `Save ${readyCount} Chapter${readyCount === 1 ? "" : "s"}`}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {staged.map((s, i) => (
              <div
                key={s.key}
                draggable
                onDragStart={() => setStagedDrag(i)}
                onDragEnd={() => {
                  setStagedDrag(null);
                  setStagedOver(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setStagedOver(i);
                }}
                onDrop={() => onStagedDrop(i)}
                className={`flex items-center gap-3 rounded-lg bg-white p-2.5 shadow-sm transition ${
                  stagedOver === i && stagedDrag !== null ? "ring-2 ring-brand/40" : ""
                } ${stagedDrag === i ? "opacity-40" : ""}`}
              >
                <span title="Drag to reorder" className="cursor-grab text-muted active:cursor-grabbing">
                  <GripVertical className="h-4 w-4" />
                </span>
                <span className="w-6 text-center text-xs font-semibold text-muted">{items.length + i + 1}</span>
                <input
                  value={s.title}
                  onChange={(e) => patchStaged(s.key, { title: e.target.value })}
                  placeholder="Chapter name"
                  className="input flex-1 py-1.5"
                />
                <span className="w-16 text-right text-xs text-muted">{mmss(s.duration)}</span>
                <label className="flex items-center gap-1.5 text-xs text-muted">
                  <input
                    type="checkbox"
                    checked={s.isPreview}
                    onChange={(e) => patchStaged(s.key, { isPreview: e.target.checked })}
                  />
                  Preview
                </label>
                <span className="flex w-14 items-center justify-center gap-1 text-center">
                  {s.status === "uploading" && (
                    <span className="flex items-center gap-1 text-xs font-medium text-muted">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      {s.progress}%
                    </span>
                  )}
                  {s.status === "done" && <CheckCircle2 className="h-4 w-4 text-brand" />}
                  {s.status === "error" && (
                    <span title={s.error}>
                      <X className="h-4 w-4 text-red-500" />
                    </span>
                  )}
                </span>
                <button onClick={() => removeStaged(s.key)} className="rounded p-1 text-muted hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {items.map((c, i) => (
          <div
            key={c.id}
            draggable={renameId !== c.id}
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => {
              e.preventDefault();
              setOverIndex(i);
            }}
            onDrop={() => onDrop(i)}
            onDragEnd={() => {
              setDragIndex(null);
              setOverIndex(null);
            }}
            className={`flex items-center justify-between rounded-xl border px-4 py-3 transition ${
              overIndex === i && dragIndex !== null ? "border-brand bg-brand-50/50" : "border-black/5"
            } ${dragIndex === i ? "opacity-40" : ""}`}
          >
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <GripVertical className="h-4 w-4 flex-shrink-0 cursor-grab text-muted active:cursor-grabbing" />
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-ivory text-xs font-bold text-brand">
                {c.chapter_number}
              </div>
              <div className="min-w-0 flex-1">
                {renameId === c.id ? (
                  <input
                    autoFocus
                    value={renameDraft}
                    onChange={(e) => setRenameDraft(e.target.value)}
                    onBlur={() => commitRename(c.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitRename(c.id);
                      if (e.key === "Escape") setRenameId(null);
                    }}
                    className="input py-1"
                  />
                ) : (
                  <div
                    className="cursor-text truncate text-sm font-semibold"
                    title="Double-click to rename"
                    onDoubleClick={() => {
                      setRenameId(c.id);
                      setRenameDraft(c.title);
                    }}
                  >
                    {c.title}
                    {c.is_preview && (
                      <span className="ml-2 rounded bg-gold-50 px-1.5 py-0.5 text-xs text-gold-600">Preview</span>
                    )}
                  </div>
                )}
                <div className="mt-1 flex items-center gap-2">
                  {c.audio_path ? (
                    <>
                      <ChapterAudio audioPath={c.audio_path} />
                      <span className="text-xs text-muted">{mmss(c.duration_seconds || 0)}</span>
                    </>
                  ) : c.content ? (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700">
                      <FileText className="h-3.5 w-3.5" /> Text chapter
                    </span>
                  ) : (
                    <span className="text-xs text-muted">No audio</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-shrink-0 items-center gap-1">
              <button
                onClick={() => {
                  setEditError("");
                  setEditing(c);
                }}
                className="rounded-lg p-1.5 text-brand hover:bg-brand-50"
                title="Edit chapter"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => remove(c.id)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50" title="Delete chapter">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && staged.length === 0 && (
          <p className="py-6 text-center text-sm text-muted">
            No chapters yet — click “Import Audio Files” to add several at once.
          </p>
        )}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Chapter">
        {editing && (
          <form action={saveEdit} className="space-y-4">
            <div>
              <label className="label">Chapter Name</label>
              <input name="title" required defaultValue={editing.title} className="input" />
            </div>
            <div>
              <label className="label">Preview (free to listen)</label>
              <select name="is_preview" defaultValue={editing.is_preview ? "true" : "false"} className="input">
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
            <div>
              <label className="label">Replace Audio (optional)</label>
              <FileUploader bucket="book-audio" name="audio_path" accept="audio/*" defaultValue={editing.audio_path || ""} label="Replace Audio" resumable />
            </div>
            <div>
              <label className="label">Text Content (optional — for text chapters)</label>
              <RichTextEditor name="content" defaultValue={editing.content || ""} />
            </div>
            {editError && <p className="text-sm text-red-500">{editError}</p>}
            <div className="flex justify-end gap-3">
              <button type="button" className="btn-ghost" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={pending}>
                {pending ? "Saving..." : "Save Chapter"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={addingText} onClose={() => setAddingText(false)} title="Add Text Chapter" wide>
        <form action={saveTextChapter} className="space-y-4">
          <div>
            <label className="label">Chapter Name</label>
            <input name="title" required placeholder="e.g. Introduction" className="input" />
          </div>
          <div>
            <label className="label">Preview (free to read)</label>
            <select name="is_preview" defaultValue="false" className="input">
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>
          <div>
            <label className="label">Chapter Text</label>
            <RichTextEditor name="content" defaultValue="" />
          </div>
          {textError && <p className="text-sm text-red-500">{textError}</p>}
          <div className="flex justify-end gap-3">
            <button type="button" className="btn-ghost" onClick={() => setAddingText(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={pending}>
              {pending ? "Saving..." : "Save Text Chapter"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
