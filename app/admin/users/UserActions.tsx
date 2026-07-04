"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Coins, Receipt } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateTime } from "@/lib/utils";
import { grantCoinsAction, fetchUserTransactionsAction } from "./actions";

export function AddCoinsButton({ userId, name }: { userId: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const res = await grantCoinsAction(userId, formData);
      if (res && res.error) setError(res.error);
      else {
        setOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg p-1.5 text-gold-600 transition hover:bg-gold-50"
        title="Add Coins"
      >
        <Coins className="h-4 w-4" />
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={`Add Coins — ${name}`}>
        <form action={submit} className="space-y-4">
          <div>
            <label className="label">Amount</label>
            <input name="amount" type="number" required className="input" placeholder="e.g. 100" />
          </div>
          <div>
            <label className="label">Note</label>
            <textarea name="note" rows={3} className="input" placeholder="Reason for grant" />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex justify-end gap-3">
            <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={pending}>
              {pending ? "Granting..." : "Add Coins"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export function ViewTransactionsButton({ userId, name }: { userId: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<any[] | null>(null);
  const [pending, startTransition] = useTransition();

  function openDrawer() {
    setOpen(true);
    if (!rows) {
      startTransition(async () => {
        const data = await fetchUserTransactionsAction(userId);
        setRows(data);
      });
    }
  }

  return (
    <>
      <button
        onClick={openDrawer}
        className="rounded-lg p-1.5 text-brand transition hover:bg-brand-50"
        title="View Transactions"
      >
        <Receipt className="h-4 w-4" />
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={`Transactions — ${name}`} wide>
        {pending && <p className="text-sm text-muted">Loading...</p>}
        {rows && rows.length === 0 && <p className="text-sm text-muted">No transactions.</p>}
        {rows && rows.length > 0 && (
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-muted">
                <tr>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Coins</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id} className="border-t border-black/5">
                    <td className="py-2 text-muted">{formatDateTime(t.created_at)}</td>
                    <td className="py-2 capitalize">{t.type}</td>
                    <td className="py-2 font-medium">{t.coin_change}</td>
                    <td className="py-2">
                      <StatusBadge status={t.payment_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </>
  );
}
