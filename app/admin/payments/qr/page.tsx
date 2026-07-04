import Link from "next/link";
import { ArrowLeft, QrCode } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { EntityForm, EditTrigger } from "@/components/admin/EntityForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { listPaymentConfigs } from "@/lib/repositories/paymentRepository";
import {
  createPaymentConfigAction,
  updatePaymentConfigAction,
  deletePaymentConfigAction,
} from "./actions";

export const dynamic = "force-dynamic";

const providerOptions = [
  { value: "jazzcash", label: "JazzCash" },
  { value: "easypaisa", label: "EasyPaisa" },
  { value: "bank", label: "Bank Transfer" },
  { value: "stripe", label: "Stripe" },
];

const fields = [
  { name: "provider", label: "Provider", type: "select" as const, options: providerOptions, required: true },
  { name: "display_name", label: "Display Name", required: true, placeholder: "e.g. JazzCash Personal" },
  { name: "country", label: "Country Code", placeholder: "PK" },
  { name: "account_details", label: "Account Details", type: "textarea" as const, placeholder: "Account name & number" },
  { name: "description", label: "Description / Instructions", type: "textarea" as const },
  { name: "qr_code_url", label: "QR Code Image", type: "file" as const, bucket: "payment-qr" },
  { name: "is_active", label: "Active (show on website)", type: "toggle" as const },
];

function providerLabel(v: string) {
  return providerOptions.find((p) => p.value === v)?.label || v;
}

export default async function PaymentQrPage() {
  const configs = await listPaymentConfigs();

  return (
    <div>
      <Link href="/admin/payments/manual" className="mb-4 inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to Payments
      </Link>
      <PageHeader
        title="Payment Accounts & QR"
        subtitle="Add, edit or remove JazzCash / EasyPaisa / Bank accounts and QR codes shown on the website"
        action={<EntityForm title="Add Payment Method" fields={fields} defaults={{ is_active: true, country: "PK" }} action={createPaymentConfigAction} wide />}
      />

      {configs.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand">
            <QrCode className="h-7 w-7" />
          </div>
          <p className="text-muted">No payment methods yet. Add JazzCash or EasyPaisa to get started.</p>
          <EntityForm title="Add Payment Method" fields={fields} defaults={{ is_active: true, country: "PK" }} action={createPaymentConfigAction} wide />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {configs.map((c: any) => (
            <div key={c.id} className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-black/5 px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <span className="font-display text-base font-bold text-ink">{providerLabel(c.provider)}</span>
                  <StatusBadge status={c.is_active ? "active" : "inactive"} />
                </div>
                <div className="flex items-center gap-1">
                  <EntityForm
                    title="Edit Payment Method"
                    fields={fields}
                    defaults={c}
                    action={updatePaymentConfigAction.bind(null, c.id)}
                    trigger={<EditTrigger />}
                    wide
                  />
                  <ConfirmDialog onConfirm={deletePaymentConfigAction.bind(null, c.id)} />
                </div>
              </div>
              <div className="flex gap-4 p-5">
                <div className="flex h-28 w-28 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-black/10 bg-white p-1">
                  {c.qr_code_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.qr_code_url} alt="QR" className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-xs text-muted">No QR</span>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1 text-sm">
                  <div className="font-semibold text-ink">{c.display_name}</div>
                  <div className="text-xs uppercase text-muted">{c.country}</div>
                  {c.account_details && <p className="whitespace-pre-line text-ink">{c.account_details}</p>}
                  {c.description && <p className="line-clamp-2 text-xs text-muted">{c.description}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
