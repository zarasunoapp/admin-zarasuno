"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, ListMusic, Eye, Pencil, Bell } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { duplicateBookAction, deleteBookAction } from "./actions";

export function BookRowActions({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function copy() {
    startTransition(async () => {
      await duplicateBookAction(id);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-end gap-0.5">
      <button onClick={copy} disabled={pending} className="rounded-lg p-1.5 text-muted hover:bg-ivory" title="Copy">
        <Copy className="h-4 w-4" />
      </button>
      <Link href={`/admin/books/${id}/edit#chapters`} className="rounded-lg p-1.5 text-brand hover:bg-brand-50" title="Chapters / Audio">
        <ListMusic className="h-4 w-4" />
      </Link>
      <Link href={`/admin/books/${id}/edit`} className="rounded-lg p-1.5 text-teal-600 hover:bg-teal-50" title="View">
        <Eye className="h-4 w-4" />
      </Link>
      <Link href={`/admin/books/${id}/edit`} className="rounded-lg p-1.5 text-brand hover:bg-brand-50" title="Edit">
        <Pencil className="h-4 w-4" />
      </Link>
      <Link href={`/admin/notifications?book=${id}`} className="rounded-lg p-1.5 text-gold-600 hover:bg-gold-50" title="Notify">
        <Bell className="h-4 w-4" />
      </Link>
      <ConfirmDialog onConfirm={deleteBookAction.bind(null, id)} />
    </div>
  );
}
