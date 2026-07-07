import Link from "next/link";
import { Eye } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { RowStatusSelect } from "@/components/admin/RowStatusSelect";
import { SelectFilter } from "@/components/admin/Filters";
import { parsePageParams, formatDate, formatNumber } from "@/lib/utils";
import { listUsers, listGroups } from "@/lib/repositories/userRepository";
import {
  setUserStatusAction,
  deleteUserAction,
} from "./actions";
import { AddCoinsButton, ViewTransactionsButton } from "./UserActions";
import { bulkDeleteAction } from "../bulk-actions";

export const dynamic = "force-dynamic";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "blocked", label: "Blocked" },
];

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const params = parsePageParams(searchParams);
  const [{ rows, count, page, perPage }, groups] = await Promise.all([
    listUsers(params),
    listGroups(),
  ]);

  const columns: Column<any>[] = [
    { key: "sr", label: "SR No", render: (_r, i) => (page - 1) * perPage + i + 1 },
    { key: "name", label: "Name", render: (r) => <span className="font-medium">{r.full_name || "—"}</span> },
    { key: "phone", label: "Phone", render: (r) => r.phone || "—" },
    { key: "customer_number", label: "Customer No", render: (r) => r.customer_number || "—" },
    { key: "email", label: "Email", render: (r) => r.email || "—" },
    {
      key: "subscription",
      label: "Coins",
      render: (r) =>
        r.coin_balance != null ? (
          <span className="font-medium text-brand">{formatNumber(r.coin_balance)} coins</span>
        ) : (
          <span className="text-muted">No Subscription</span>
        ),
    },
    { key: "group", label: "Group", render: (r) => r.group_name || "—" },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <RowStatusSelect
          value={r.status || "active"}
          options={statusOptions}
          onChange={setUserStatusAction.bind(null, r.id)}
        />
      ),
    },
    { key: "created_at", label: "Created At", render: (r) => formatDate(r.created_at) },
    {
      key: "action",
      label: "Action",
      className: "text-right",
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <Link href={`/admin/users/${r.id}`} className="rounded-lg p-1.5 text-teal-600 transition hover:bg-teal-50">
            <Eye className="h-4 w-4" />
          </Link>
          <AddCoinsButton userId={r.id} name={r.full_name || r.email || "user"} />
          <ViewTransactionsButton userId={r.id} name={r.full_name || r.email || "user"} />
          <ConfirmDialog onConfirm={deleteUserAction.bind(null, r.id)} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Users" subtitle={`${formatNumber(count)} total users`} />
      <DataTable
        columns={columns}
        rows={rows}
        count={count}
        page={page}
        perPage={perPage}
        searchPlaceholder="Search users..."
        toolbar={
          <>
            <SelectFilter paramKey="status" label="Status" options={statusOptions} />
            {groups.length > 0 && (
              <SelectFilter
                paramKey="filter"
                label="Group"
                options={groups.map((g) => ({ value: g, label: g }))}
              />
            )}
          </>
        }
        bulkDelete={bulkDeleteAction.bind(null, "profiles", "/admin/users")}
        bulkLabel="users"
      />
    </div>
  );
}
