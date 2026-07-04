import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { DateRangeFilter } from "@/components/admin/Filters";
import { ExportButtons } from "@/components/admin/ExportButtons";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { parsePageParams, formatDateTime, formatMoney } from "@/lib/utils";
import { listSales } from "@/lib/repositories/transactionRepository";

export const dynamic = "force-dynamic";

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const params = parsePageParams(searchParams);
  const { rows, count, page, perPage } = await listSales(params);

  const columns: Column<any>[] = [
    { key: "sr", label: "#", render: (_r, i) => (page - 1) * perPage + i + 1 },
    { key: "date", label: "Transaction Date", render: (r) => formatDateTime(r.created_at) },
    {
      key: "id",
      label: "Transaction ID",
      render: (r) => <span className="font-mono text-xs">{String(r.id).slice(0, 8)}</span>,
    },
    { key: "user", label: "Order BY", render: (r) => r.profiles?.full_name || r.profiles?.email || "—" },
    { key: "package", label: "Package Name", render: (r) => r.coin_packages?.name || "-" },
    { key: "package_type", label: "Package Type", render: () => "Coins" },
    { key: "amount", label: "Total Amount", render: (r) => formatMoney(r.amount) },
    { key: "provider", label: "Payment Type", render: (r) => <span className="capitalize">{r.payment_provider || "—"}</span> },
    { key: "payment_status", label: "Payment Status", render: (r) => <StatusBadge status={r.payment_status} /> },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.payment_status === "completed" ? "completed" : r.payment_status} /> },
  ];

  return (
    <div>
      <PageHeader title="Sales" subtitle="Coin purchase transactions" action={<ExportButtons report="sales" />} />
      <DataTable
        columns={columns}
        rows={rows}
        count={count}
        page={page}
        perPage={perPage}
        searchPlaceholder="Search by ID / provider..."
        toolbar={<DateRangeFilter />}
      />
    </div>
  );
}
