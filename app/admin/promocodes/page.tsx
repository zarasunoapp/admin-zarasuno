import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { EntityForm, EditTrigger } from "@/components/admin/EntityForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { parsePageParams } from "@/lib/utils";
import { listPromocodes } from "@/lib/repositories/promocodeRepository";
import { listAllCoinPackages } from "@/lib/repositories/coinPackageRepository";
import {
  createPromocodeAction,
  updatePromocodeAction,
  deletePromocodeAction,
} from "./actions";
import { bulkDeleteAction } from "../bulk-actions";

export const dynamic = "force-dynamic";

export default async function PromocodesPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const params = parsePageParams(searchParams);
  const [{ rows, count, page, perPage }, packages] = await Promise.all([
    listPromocodes(params),
    listAllCoinPackages(),
  ]);

  const fields = [
    { name: "name", label: "Name", required: true },
    { name: "code", label: "Code", required: true },
    {
      name: "reward_type",
      label: "Reward Type",
      type: "select" as const,
      required: true,
      options: [
        { value: "coins", label: "Free Coins" },
        { value: "discount", label: "Package Discount (%)" },
      ],
    },
    { name: "coin_reward", label: "Value (Coins) — for Free Coins", type: "number" as const },
    { name: "discount_percent", label: "Discount % — for Package Discount", type: "number" as const },
    {
      name: "package_id",
      label: "Apply to Package (optional; blank = all)",
      type: "select" as const,
      options: packages.map((p: any) => ({ value: p.id, label: p.name })),
    },
    { name: "starts_at", label: "Start Date", type: "date" as const },
    { name: "expires_at", label: "End Date", type: "date" as const },
    { name: "max_uses", label: "Number Of Redeem", type: "number" as const },
    { name: "per_user_limit", label: "Maximum Per Use", type: "number" as const },
    { name: "is_active", label: "Active", type: "toggle" as const },
  ];

  const columns: Column<any>[] = [
    { key: "sr", label: "SR No", render: (_r, i) => (page - 1) * perPage + i + 1 },
    { key: "name", label: "Name" },
    {
      key: "code",
      label: "Code",
      render: (r) => (
        <span className="rounded-md bg-gold-50 px-2 py-1 font-mono text-xs font-bold text-gold-600">
          {r.code}
        </span>
      ),
    },
    {
      key: "reward",
      label: "Reward",
      render: (r) =>
        r.reward_type === "discount"
          ? `${r.discount_percent || 0}% off`
          : `${r.coin_reward || 0} coins`,
    },
    { key: "is_active", label: "Status", render: (r) => <StatusBadge status={r.is_active ? "active" : "inactive"} /> },
    {
      key: "action",
      label: "Action",
      className: "text-right",
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <EntityForm
            title="Edit Promo Code"
            fields={fields}
            defaults={r}
            action={updatePromocodeAction.bind(null, r.id)}
            trigger={<EditTrigger />}
            wide
          />
          <ConfirmDialog onConfirm={deletePromocodeAction.bind(null, r.id)} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Promocodes"
        action={<EntityForm title="Add Promo Code" fields={fields} action={createPromocodeAction} wide />}
      />
      <DataTable
        columns={columns}
        rows={rows}
        count={count}
        page={page}
        perPage={perPage}
        searchPlaceholder="Search promocodes..."
        bulkDelete={bulkDeleteAction.bind(null, "promocodes", "/admin/promocodes")}
        bulkLabel="promocodes"
      />
    </div>
  );
}
