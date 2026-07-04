import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { DateRangeFilter } from "@/components/admin/Filters";
import { ExportButtons } from "@/components/admin/ExportButtons";
import { parsePageParams, formatDateTime, formatNumber } from "@/lib/utils";
import { listPurchaseReport } from "@/lib/repositories/transactionRepository";

export const dynamic = "force-dynamic";

export default async function PurchaseReport({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const params = parsePageParams(searchParams);
  const { rows, count, page, perPage } = await listPurchaseReport(params);

  const columns: Column<any>[] = [
    { key: "sr", label: "#", render: (_r, i) => (page - 1) * perPage + i + 1 },
    { key: "date", label: "Transaction Date", render: (r) => formatDateTime(r.created_at) },
    { key: "id", label: "Transaction ID", render: (r) => <span className="font-mono text-xs">{String(r.id).slice(0, 8)}</span> },
    { key: "user", label: "Order BY", render: (r) => r.profiles?.full_name || "—" },
    { key: "book", label: "Book Name", render: (r) => r.books?.title || "—" },
    { key: "author", label: "Author Name", render: (r) => r.books?.authors?.name || "—" },
    { key: "publisher", label: "Publisher", render: (r) => r.books?.publishers?.name || "—" },
    { key: "coins", label: "Coins", render: (r) => formatNumber(Math.abs(r.coin_change || 0)) },
    { key: "payment_type", label: "Payment Type", render: () => "Wallet" },
  ];

  return (
    <div>
      <PageHeader title="Purchase Report" subtitle="Book unlocks via coins" action={<ExportButtons report="purchase" />} />
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
