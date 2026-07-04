"use client";

import { createContext, useContext, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { toast } from "@/lib/toast";

type SelectionValue = {
  selected: string[];
  isSelected: (id: string) => boolean;
  toggle: (id: string) => void;
  toggleAll: () => void;
  allSelected: boolean;
  clear: () => void;
  count: number;
};

const SelectionContext = createContext<SelectionValue | null>(null);

export function SelectionProvider({ ids, children }: { ids: string[]; children: React.ReactNode }) {
  const [selected, setSelected] = useState<string[]>([]);

  const value = useMemo<SelectionValue>(
    () => ({
      selected,
      isSelected: (id) => selected.includes(id),
      toggle: (id) =>
        setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id])),
      toggleAll: () => setSelected((s) => (s.length === ids.length ? [] : [...ids])),
      allSelected: ids.length > 0 && selected.length === ids.length,
      clear: () => setSelected([]),
      count: selected.length,
    }),
    [selected, ids]
  );

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelection() {
  return useContext(SelectionContext);
}

export function HeaderCheckbox() {
  const s = useSelection();
  if (!s) return null;
  return (
    <input
      type="checkbox"
      checked={s.allSelected}
      onChange={s.toggleAll}
      className="h-4 w-4 cursor-pointer accent-brand"
    />
  );
}

export function RowCheckbox({ id }: { id: string }) {
  const s = useSelection();
  if (!s) return null;
  return (
    <input
      type="checkbox"
      checked={s.isSelected(id)}
      onChange={() => s.toggle(id)}
      className="h-4 w-4 cursor-pointer accent-brand"
    />
  );
}

export function BulkDeleteBar({
  bulkDelete,
  label = "items",
}: {
  bulkDelete: (ids: string[]) => Promise<{ error?: string } | void>;
  label?: string;
}) {
  const s = useSelection();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  if (!s || s.count === 0) return null;

  function confirm() {
    setError("");
    startTransition(async () => {
      const res = await bulkDelete!(s!.selected);
      if (res && res.error) {
        setError(res.error);
        toast(res.error, "error");
        return;
      }
      const n = s!.count;
      s!.clear();
      setOpen(false);
      toast(`${n} ${label} deleted`, "success");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-between border-b border-black/5 bg-red-50/60 px-5 py-2.5">
      <span className="text-sm font-medium text-red-700">
        {s.count} {label} selected
      </span>
      <div className="flex items-center gap-2">
        <button className="btn-ghost py-1.5" onClick={s.clear}>
          Clear
        </button>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-red-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-600"
        >
          <Trash2 className="h-4 w-4" /> Delete Selected
        </button>
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title={`Delete ${s.count} ${label}?`}>
        <p className="text-sm text-muted">
          This will permanently delete {s.count} selected {label}. This action cannot be undone.
        </p>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button className="btn-ghost" onClick={() => setOpen(false)}>
            Cancel
          </button>
          <button
            disabled={pending}
            onClick={confirm}
            className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
          >
            {pending ? "Deleting..." : `Delete ${s.count}`}
          </button>
        </div>
      </Modal>
    </div>
  );
}
