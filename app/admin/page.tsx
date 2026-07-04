import { BookOpen, Users, Receipt, UserSquare2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { ChartCard, LineTrend, BarCompare, DonutDistribution } from "@/components/admin/Charts";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDateTime, formatMoney, formatNumber } from "@/lib/utils";
import {
  getDashboardStats,
  getMonthlySales,
  getMonthlyNewUsers,
  getSalesByProvider,
  getUsersByCategory,
} from "@/lib/repositories/dashboardRepository";
import { listLatestBooks } from "@/lib/repositories/bookRepository";
import { listLatestTransactions } from "@/lib/repositories/transactionRepository";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, monthlySales, newUsers, byProvider, byCategory, latestBooks, latestTx] =
    await Promise.all([
      getDashboardStats(),
      getMonthlySales(),
      getMonthlyNewUsers(),
      getSalesByProvider(),
      getUsersByCategory(),
      listLatestBooks(8),
      listLatestTransactions(8),
    ]);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of your ZaraSuno platform" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Books" value={formatNumber(stats.totalBooks)} icon={BookOpen} accent="green" />
        <StatCard label="Total Authors" value={formatNumber(stats.totalAuthors)} icon={UserSquare2} accent="gold" />
        <StatCard label="Total Sales" value={formatNumber(stats.totalSales)} icon={Receipt} accent="clay" />
        <StatCard label="Total Users" value={formatNumber(stats.totalUsers)} icon={Users} accent="dark" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Sales Value (Monthly)">
          <LineTrend data={monthlySales} xKey="month" yKey="value" />
        </ChartCard>
        <ChartCard title="New Users (Monthly)">
          <BarCompare data={newUsers} xKey="month" yKey="value" />
        </ChartCard>
        <ChartCard title="Sales by Payment Provider">
          <DonutDistribution data={byProvider} />
        </ChartCard>
        <ChartCard title="Users by Selected Category">
          <DonutDistribution data={byCategory} />
        </ChartCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 font-display text-base font-bold text-ink">Latest Books</h3>
          <div className="space-y-3">
            {latestBooks.map((b: any) => (
              <div key={b.id} className="flex items-center gap-3">
                <div className="h-12 w-9 flex-shrink-0 overflow-hidden rounded-md bg-ivory">
                  {b.cover_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.cover_url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-ink">{b.title}</div>
                  <div className="text-xs text-muted">{b.authors?.name || "Unknown"}</div>
                </div>
                <span className="text-xs capitalize text-muted">{b.book_type}</span>
              </div>
            ))}
            {latestBooks.length === 0 && <p className="text-sm text-muted">No books yet.</p>}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="mb-4 font-display text-base font-bold text-ink">Last Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase text-muted">
                  <th className="pb-2 font-semibold">Date</th>
                  <th className="pb-2 font-semibold">User</th>
                  <th className="pb-2 font-semibold">Status</th>
                  <th className="pb-2 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {latestTx.map((t: any) => (
                  <tr key={t.id} className="border-t border-black/5">
                    <td className="py-2.5 text-muted">{formatDateTime(t.created_at)}</td>
                    <td className="py-2.5">{t.profiles?.full_name || "—"}</td>
                    <td className="py-2.5">
                      <StatusBadge status={t.payment_status} />
                    </td>
                    <td className="py-2.5 text-right font-medium">{formatMoney(t.amount)}</td>
                  </tr>
                ))}
                {latestTx.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-muted">
                      No transactions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
