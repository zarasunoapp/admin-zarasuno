"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, ArrowUp, ArrowDown } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MultiSelect } from "@/components/admin/MultiSelect";
import { EditTrigger } from "@/components/admin/EntityForm";
import {
  createCarouselAction,
  updateCarouselAction,
  deleteCarouselAction,
  reorderCarouselsAction,
} from "./actions";

const TYPES = [
  "books_of_month",
  "recently_added",
  "most_popular",
  "recommended",
  "category",
  "language",
  "collection",
  "manual",
];

type Option = { value: string; label: string };

export function CarouselsTab({
  carousels,
  categories,
  collections,
  books,
}: {
  carousels: any[];
  categories: Option[];
  collections: Option[];
  books: Option[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function move(index: number, dir: -1 | 1) {
    const next = [...carousels];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    startTransition(async () => {
      await reorderCarouselsAction(next.map((c) => c.id));
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <CarouselForm
          title="Add Carousel"
          action={createCarouselAction}
          categories={categories}
          collections={collections}
          books={books}
        />
      </div>
      <div className="space-y-3">
        {carousels.map((c, i) => (
          <div key={c.id} className="card flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <button onClick={() => move(i, -1)} className="text-muted hover:text-ink">
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button onClick={() => move(i, 1)} className="text-muted hover:text-ink">
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
              <div>
                <div className="font-semibold text-ink">{c.title}</div>
                <div className="text-xs text-muted">
                  {c.type} · limit {c.book_limit}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={c.is_active ? "active" : "inactive"} />
              <CarouselForm
                title="Edit Carousel"
                action={updateCarouselAction.bind(null, c.id)}
                categories={categories}
                collections={collections}
                books={books}
                defaults={c}
                edit
              />
              <ConfirmDialog onConfirm={deleteCarouselAction.bind(null, c.id)} />
            </div>
          </div>
        ))}
        {carousels.length === 0 && <p className="text-sm text-muted">No carousels yet.</p>}
      </div>
    </div>
  );
}

function CarouselForm({
  title,
  action,
  categories,
  collections,
  books,
  defaults,
  edit,
}: {
  title: string;
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  categories: Option[];
  collections: Option[];
  books: Option[];
  defaults?: any;
  edit?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(defaults?.type || "recently_added");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const res = await action(formData);
      if (res && res.error) setError(res.error);
      else {
        setOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>
        {edit ? (
          <EditTrigger />
        ) : (
          <button className="btn-primary">
            <Plus className="h-4 w-4" /> {title}
          </button>
        )}
      </span>
      <Modal open={open} onClose={() => setOpen(false)} title={title} wide>
        <form action={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Title *</label>
            <input name="title" required defaultValue={defaults?.title} className="input" />
          </div>
          <div>
            <label className="label">Type *</label>
            <select name="type" value={type} onChange={(e) => setType(e.target.value)} className="input">
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Category</label>
            <select name="category_id" defaultValue={defaults?.category_id || ""} className="input">
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Collection</label>
            <select name="collection_id" defaultValue={defaults?.collection_id || ""} className="input">
              <option value="">None</option>
              {collections.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Language Code</label>
            <input name="language_code" defaultValue={defaults?.language_code || ""} className="input" placeholder="en / ur" />
          </div>
          <div>
            <label className="label">Book Limit</label>
            <input name="book_limit" type="number" defaultValue={defaults?.book_limit ?? 10} className="input" />
          </div>
          <div>
            <label className="label">Requires Auth</label>
            <select name="requires_auth" defaultValue={defaults?.requires_auth ? "true" : "false"} className="input">
              <option value="false">No</option>
              <option value="true">Yes</option>
            </select>
          </div>
          <div>
            <label className="label">Active</label>
            <select name="is_active" defaultValue={defaults?.is_active === false ? "false" : "true"} className="input">
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          {type === "manual" && (
            <div className="sm:col-span-2">
              <label className="label">Select Books (manual)</label>
              <MultiSelect name="book_ids" options={books} />
            </div>
          )}
          {error && <p className="text-sm text-red-500 sm:col-span-2">{error}</p>}
          <div className="flex justify-end gap-3 sm:col-span-2">
            <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={pending}>
              {pending ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
