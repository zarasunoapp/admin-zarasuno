import Link from "next/link";
import { QrCode } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { EntityForm } from "@/components/admin/EntityForm";
import { parsePageParams, formatDateTime, formatNumber } from "@/lib/utils";
import { listManualPayments } from "@/lib/repositories/paymentRepository";
import { listAllCoinPackages } from "@/lib/repositories/coinPackageRepository";
import { ApproveReject } from "./ApproveReject";
import { addManualPaymentAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function ManualPaymentsPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const params = parsePageParams(searchParams);
  const [{ rows, count, page, perPage }, packages] = await Promise.all([
    listManualPayments(params),
    listAllCoinPackages(),
  ]);

  const addFields = [
    { name: "user_identifier", label: "User (email / customer no. / ID)", required: true, colSpan: 2 as const },
    {
      name: "package_id",
      label: "Package",
      type: "select" as const,
      required: true,
      options: packages.map((p: any) => ({ value: p.id, label: p.name })),
    },
    {
      name: "provider",
      label: "Provider",
      type: "select" as const,
      options: [
        { value: "jazzcash", label: "JazzCash" },
        { value: "easypaisa", label: "EasyPaisa" },
        { value: "manual", label: "Manual / Other" },
      ],
    },
    { name: "payment_reference", label: "TID / Reference" },
    { name: "payment_proof_url", label: "Screenshot / Proof", type: "file" as const, bucket: "payment-proofs" },
  ];

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
          <a href={r.payment_proof_url} target="_blank" rel="noreferrer" className="text-brand underline">
            View
          </a>
        ) : (
          "—"
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
          <div className="flex flex-wrap items-center gap-2">
            <EntityForm title="Add Manual Payment" fields={addFields} action={addManualPaymentAction} submitLabel="Add to Queue" wide />
            <Link href="/admin/payments/qr" className="btn-gold">
              <QrCode className="h-4 w-4" /> Payment Accounts & QR
            </Link>
          </div>
        }
      />
      <DataTable columns={columns} rows={rows} count={count} page={page} perPage={perPage} searchPlaceholder="Search by ID..." />
    </div>
  );
}
