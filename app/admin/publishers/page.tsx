import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { EntityForm, EditTrigger } from "@/components/admin/EntityForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CsvImport } from "@/components/admin/CsvImport";
import { parsePageParams } from "@/lib/utils";
import { listPublishers } from "@/lib/repositories/publisherRepository";
import {
  createPublisherAction,
  updatePublisherAction,
  deletePublisherAction,
  importPublishersAction,
} from "./actions";
import { bulkDeleteAction } from "../bulk-actions";

export const dynamic = "force-dynamic";

const fields = [
  { name: "name", label: "Name", required: true },
  { name: "email", label: "Email (portal login)", type: "email" as const },
  { name: "country", label: "Publisher Country" },
  { name: "password", label: "Portal Login Password (leave blank on edit to keep)", type: "password" as const },
];

export default async function PublishersPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const params = parsePageParams(searchParams);
  const { rows, count, page, perPage } = await listPublishers(params);

  const columns: Column<any>[] = [
    { key: "sr", label: "SR No", render: (_r, i) => (page - 1) * perPage + i + 1 },
    { key: "name", label: "Name" },
    { key: "email", label: "Email", render: (r) => r.email || "—" },
    { key: "country", label: "Country", render: (r) => r.country || "—" },
    {
      key: "action",
      label: "Action",
      className: "text-right",
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <EntityForm
            title="Edit Publisher"
            fields={fields}
            defaults={r}
            action={updatePublisherAction.bind(null, r.id)}
            trigger={<EditTrigger />}
          />
          <ConfirmDialog onConfirm={deletePublisherAction.bind(null, r.id)} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Publishers"
        subtitle="Manage book publishers"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <CsvImport headers={["name", "email"]} action={importPublishersAction} label="Import Publisher" />
            <EntityForm title="Add New Publisher" fields={fields} action={createPublisherAction} />
          </div>
        }
      />
      <DataTable
        columns={columns}
        rows={rows}
        count={count}
        page={page}
        perPage={perPage}
        searchPlaceholder="Search publishers..."
        bulkDelete={bulkDeleteAction.bind(null, "publishers", "/admin/publishers")}
        bulkLabel="publishers"
      />
    </div>
  );
}
