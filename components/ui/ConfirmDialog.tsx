"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "./Modal";
import { toast } from "@/lib/toast";

export function ConfirmDialog({
  trigger,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Delete",
  onConfirm,
}: {
  trigger?: React.ReactNode;
  title?: string;
  message?: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <span onClick={() => setOpen(true)}>
        {trigger ?? (
          <button className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </span>
      <Modal open={open} onClose={() => setOpen(false)} title={title}>
        <p className="text-sm text-muted">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="btn-ghost" onClick={() => setOpen(false)}>
            Cancel
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await onConfirm();
                setOpen(false);
                toast("Deleted successfully", "success");
              })
            }
          >
            {confirmLabel}
          </button>
        </div>
      </Modal>
    </>
  );
}
