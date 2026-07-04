"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { FileUploader } from "@/components/admin/FileUploader";
import { MultiSelect } from "@/components/admin/MultiSelect";
import { EditTrigger } from "@/components/admin/EntityForm";

export function CollectionForm({
  title,
  action,
  books,
  defaults,
  edit,
}: {
  title: string;
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  books: { value: string; label: string }[];
  defaults?: any;
  edit?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const selectedBooks: string[] =
    defaults?.collection_books?.map((cb: any) => cb.book_id) ?? [];

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
            <label className="label">Collection Title *</label>
            <input name="title" required defaultValue={defaults?.title} className="input" />
          </div>
          <div>
            <label className="label">Status *</label>
            <select name="status" defaultValue={defaults?.status || "active"} className="input">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Collection Description</label>
            <textarea name="description" rows={3} defaultValue={defaults?.description} className="input" />
          </div>
          <div>
            <label className="label">Collection Image</label>
            <FileUploader bucket="collections" name="image_url" defaultValue={defaults?.image_url || ""} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Select Books</label>
            <MultiSelect name="book_ids" options={books} defaultSelected={selectedBooks} />
          </div>
          <div>
            <label className="label">Country Include (comma separated)</label>
            <input name="country_include" defaultValue={(defaults?.country_include || []).join(",")} className="input" />
          </div>
          <div>
            <label className="label">Country Exclude (comma separated)</label>
            <input name="country_exclude" defaultValue={(defaults?.country_exclude || []).join(",")} className="input" />
          </div>
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
