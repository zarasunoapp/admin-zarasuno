import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { DateRangeFilter } from "@/components/admin/Filters";
import { ExportButtons } from "@/components/admin/ExportButtons";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { parsePageParams, formatDateTime, formatMoney, formatNumber } from "@/lib/utils";
import { listCoinPurchaseReport } from "@/lib/repositories/transactionRepository";

export const dynamic = "force-dynamic";

export default async function CoinPurchaseReport({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const params = parsePageParams(searchParams);
  const { rows, count, page, perPage } = await listCoinPurchaseReport(params);

  const columns: Column<any>[] = [
    { key: "sr", label: "#", render: (_r, i) => (page - 1) * perPage + i + 1 },
    { key: "date", label: "Transaction Date", render: (r) => formatDateTime(r.created_at) },
    { key: "id", label: "Transaction ID", render: (r) => <span className="font-mono text-xs">{String(r.id).slice(0, 8)}</span> },
    { key: "user", label: "Order BY", render: (r) => r.profiles?.full_name || "—" },
    { key: "package", label: "Package Name", render: (r) => r.coin_packages?.name || "—" },
    { key: "coins", label: "Coins", render: (r) => formatNumber(r.coin_change) },
    { key: "amount", label: "Amount", render: (r) => (r.amount != null ? formatMoney(r.amount) : "--") },
    { key: "payment_type", label: "Payment Type", render: (r) => <span className="capitalize">{r.type === "admin_grant" ? "Admin" : r.payment_provider}</span> },
    { key: "status", label: "Payment Status", render: (r) => <StatusBadge status={r.payment_status} /> },
  ];

  return (
    <div>
      <PageHeader title="Coin Purchase Report" action={<ExportButtons report="coin-purchase" />} />
      <DataTable
        columns={columns}
        rows={rows}
        count={count}
        page={page}
        perPage={perPage}
        searchPlaceholder="Search transaction ID..."
        toolbar={<DateRangeFilter />}
      />
    </div>
  );
}
