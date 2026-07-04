import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateTime, formatNumber } from "@/lib/utils";
import {
  getUser,
  getUserTransactions,
  getUserUnlocks,
  getUserFavourites,
  getUserProgress,
} from "@/lib/repositories/userRepository";
import { listAllBooks } from "@/lib/repositories/bookRepository";
import { Coins, BookOpen, Heart, Headphones } from "lucide-react";
import { GrantBookAccess, ToggleAdminRole } from "./UserDetailActions";

export const dynamic = "force-dynamic";

export default async function UserDetailPage({ params }: { params: { id: string } }) {
  const user = await getUser(params.id);
  if (!user) notFound();

  const [transactions, unlocks, favourites, progress, books] = await Promise.all([
    getUserTransactions(params.id),
    getUserUnlocks(params.id),
    getUserFavourites(params.id),
    getUserProgress(params.id),
    listAllBooks(),
  ]);

  return (
    <div>
      <Link href="/admin/users" className="mb-4 inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to Users
      </Link>
      <PageHeader
        title={user.full_name || user.email || "User"}
        subtitle={user.email}
        action={<ToggleAdminRole userId={user.id} isAdmin={user.role === "admin"} />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Coin Balance" value={formatNumber(user.coin_balance ?? 0)} icon={Coins} accent="gold" />
        <StatCard label="Unlocked Books" value={unlocks.length} icon={BookOpen} accent="green" />
        <StatCard label="Favourites" value={favourites.length} icon={Heart} accent="clay" />
        <StatCard label="In Progress" value={progress.length} icon={Headphones} accent="dark" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-3 font-display text-base font-bold">Profile</h3>
          <dl className="space-y-2 text-sm">
            <Row label="Phone" value={user.phone} />
            <Row label="Customer Number" value={user.customer_number} />
            <Row label="Group" value={user.group_name} />
            <Row label="Status" value={<StatusBadge status={user.status || "active"} />} />
            <Row label="Role" value={user.role} />
          </dl>
        </div>

        <div className="card p-5">
          <h3 className="mb-3 font-display text-base font-bold">Grant Book Access</h3>
          <GrantBookAccess userId={user.id} books={books} />
          <div className="mt-4 space-y-2">
            {unlocks.map((u: any) => (
              <div key={u.id} className="flex items-center justify-between text-sm">
                <span>{u.books?.title || "—"}</span>
                <span className="text-xs capitalize text-muted">{u.unlock_method}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card mt-6 overflow-hidden">
        <h3 className="border-b border-black/5 px-5 py-4 font-display text-base font-bold">Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-ivory/60 text-xs uppercase text-muted">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Coins</th>
                <th className="px-5 py-3">Provider</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t: any) => (
                <tr key={t.id} className="border-t border-black/5">
                  <td className="px-5 py-3 text-muted">{formatDateTime(t.created_at)}</td>
                  <td className="px-5 py-3 capitalize">{t.type}</td>
                  <td className="px-5 py-3 font-medium">{t.coin_change}</td>
                  <td className="px-5 py-3 capitalize">{t.payment_provider}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={t.payment_status} />
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted">
                    No transactions.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium capitalize">{value || "—"}</dd>
    </div>
  );
}
