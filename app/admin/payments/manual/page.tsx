import Link from "next/link";
import { QrCode } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { parsePageParams, formatDateTime, formatNumber } from "@/lib/utils";
import { listManualPayments } from "@/lib/repositories/paymentRepository";
import { ApproveReject } from "./ApproveReject";

export const dynamic = "force-dynamic";

export default async function ManualPaymentsPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const params = parsePageParams(searchParams);
  const { rows, count, page, perPage } = await listManualPayments(params);

  const columns: Column<any>[] = [
    { key: "sr", label: "#", render: (_r, i) => (page - 1) * perPage + i + 1 },
    { key: "date", label: "Date", render: (r) => formatDateTime(r.created_at) },
    { key: "user", label: "User", render: (r) => r.profiles?.full_name || r.profiles?.email || "—" },
    { key: "package", label: "Package", render: (r) => r.coin_packages?.name || "—" },
    { key: "coins", label: "Coins", render: (r) => formatNumber(r.coin_change || r.coin_packages?.coin_amount || 0) },
    { key: "provider", label: "Provider", render: (r) => <span className="capitalize">{r.payment_provider}</span> },
    { key: "reference", label: "Reference", render: (r) => r.payment_reference || "—" },
    {
      key: "proof",
      label: "Proof",
      render: (r) =>
        r.payment_proof_url ? (
          <a
            href={r.payment_proof_url}
            target="_blank"
            rel="noreferrer"
            title="Open full screenshot"
            className="group inline-flex"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={r.payment_proof_url}
              alt="proof"
              className="h-14 w-14 rounded-lg border border-black/10 object-cover transition group-hover:ring-2 group-hover:ring-brand/40"
            />
          </a>
        ) : (
          <span className="text-muted">No proof</span>
        ),
    },
    {
      key: "action",
      label: "Action",
      className: "text-right",
      render: (r) => <ApproveReject id={r.id} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Manual Payments"
        subtitle="JazzCash / EasyPaisa / manual queue"
        action={
          <Link href="/admin/payments/qr" className="btn-gold">
            <QrCode className="h-4 w-4" /> Payment Accounts & QR
          </Link>
        }
      />
      <DataTable columns={columns} rows={rows} count={count} page={page} perPage={perPage} searchPlaceholder="Search by ID..." />
    </div>
  );
}
