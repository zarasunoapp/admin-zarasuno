import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { EntityForm, EditTrigger } from "@/components/admin/EntityForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CsvImport } from "@/components/admin/CsvImport";
import { parsePageParams } from "@/lib/utils";
import { listPublisherCountries } from "@/lib/repositories/publisherCountryRepository";
import {
  createPublisherCountryAction,
  updatePublisherCountryAction,
  deletePublisherCountryAction,
  importPublisherCountriesAction,
} from "./actions";
import { bulkDeleteAction } from "../bulk-actions";

export const dynamic = "force-dynamic";

const fields = [{ name: "name", label: "Name", required: true, colSpan: 2 as const }];

export default async function PublisherCountriesPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const params = parsePageParams(searchParams);
  const { rows, count, page, perPage } = await listPublisherCountries(params);

  const columns: Column<any>[] = [
    { key: "sr", label: "SR No", render: (_r, i) => (page - 1) * perPage + i + 1 },
    { key: "name", label: "Name" },
    {
      key: "action",
      label: "Action",
      className: "text-right",
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <EntityForm
            title="Edit Country"
            fields={fields}
            defaults={r}
            action={updatePublisherCountryAction.bind(null, r.id)}
            trigger={<EditTrigger />}
          />
          <ConfirmDialog onConfirm={deletePublisherCountryAction.bind(null, r.id)} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Publisher Countries"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <CsvImport headers={["name"]} action={importPublisherCountriesAction} label="Import CSV" />
            <EntityForm title="Add New Country" fields={fields} action={createPublisherCountryAction} />
          </div>
        }
      />
      <DataTable
        columns={columns}
        rows={rows}
        count={count}
        page={page}
        perPage={perPage}
        searchPlaceholder="Search countries..."
        bulkDelete={bulkDeleteAction.bind(null, "publisher_countries", "/admin/publisher-countries")}
        bulkLabel="countries"
      />
    </div>
  );
}
