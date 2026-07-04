import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { EntityForm, EditTrigger } from "@/components/admin/EntityForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SelectFilter } from "@/components/admin/Filters";
import { parsePageParams, formatMoney, formatNumber } from "@/lib/utils";
import { listCoinPackages } from "@/lib/repositories/coinPackageRepository";
import {
  createCoinPackageAction,
  updateCoinPackageAction,
  deleteCoinPackageAction,
} from "./actions";
import { bulkDeleteAction } from "../bulk-actions";

export const dynamic = "force-dynamic";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "inactive", label: "Inactive" },
];

const fields = [
  { name: "name", label: "Name", required: true },
  { name: "price", label: "Price", type: "number" as const, required: true },
  { name: "coin_amount", label: "Coin", type: "number" as const, required: true },
  { name: "bundle_id", label: "Bundle Id" },
  { name: "status", label: "Status", type: "select" as const, options: statusOptions },
  { name: "description", label: "Description", type: "textarea" as const },
];

export default async function ProductCoinsPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const params = parsePageParams(searchParams);
  const { rows, count, page, perPage } = await listCoinPackages(params);

  const columns: Column<any>[] = [
    { key: "sr", label: "SR No", render: (_r, i) => (page - 1) * perPage + i + 1 },
    { key: "name", label: "Name" },
    { key: "price", label: "Price", render: (r) => formatMoney(r.price) },
    { key: "coin_amount", label: "Coin", render: (r) => formatNumber(r.coin_amount) },
    { key: "bundle_id", label: "Bundle ID", render: (r) => r.bundle_id || "—" },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "description", label: "Description", render: (r) => <span className="line-clamp-1 max-w-40 text-muted">{r.description || "—"}</span> },
    {
      key: "action",
      label: "Action",
      className: "text-right",
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <EntityForm
            title="Edit ProductCoin"
            fields={fields}
            defaults={r}
            action={updateCoinPackageAction.bind(null, r.id)}
            trigger={<EditTrigger />}
          />
          <ConfirmDialog onConfirm={deleteCoinPackageAction.bind(null, r.id)} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Product Coins"
        action={<EntityForm title="Add ProductCoin" fields={fields} action={createCoinPackageAction} />}
      />
      <DataTable
        columns={columns}
        rows={rows}
        count={count}
        page={page}
        perPage={perPage}
        searchPlaceholder="Search packages..."
        toolbar={<SelectFilter paramKey="status" label="Status" options={statusOptions} />}
        bulkDelete={bulkDeleteAction.bind(null, "coin_packages", "/admin/product-coins")}
        bulkLabel="packages"
      />
    </div>
  );
}
