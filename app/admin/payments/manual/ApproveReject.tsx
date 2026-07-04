"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { approvePaymentAction, rejectPaymentAction } from "./actions";

export function ApproveReject({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function run(fn: (id: string) => Promise<void>) {
    startTransition(async () => {
      await fn(id);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        disabled={pending}
        onClick={() => run(approvePaymentAction)}
        className="inline-flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
      >
        <Check className="h-3.5 w-3.5" /> Approve
      </button>
      <button
        disabled={pending}
        onClick={() => run(rejectPaymentAction)}
        className="inline-flex items-center gap-1 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50"
      >
        <X className="h-3.5 w-3.5" /> Reject
      </button>
    </div>
  );
}
