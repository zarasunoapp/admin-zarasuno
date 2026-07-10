import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { EntityForm, EditTrigger } from "@/components/admin/EntityForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { parsePageParams } from "@/lib/utils";
import { listAuthors } from "@/lib/repositories/authorRepository";
import { createAuthorAction, updateAuthorAction, deleteAuthorAction } from "./actions";
import { bulkDeleteAction } from "../bulk-actions";

export const dynamic = "force-dynamic";

const fields = [
  { name: "name", label: "Author Name", required: true },
  { name: "email", label: "Email", type: "email" as const },
  { name: "country", label: "Author Country" },
  { name: "password", label: "Password", type: "password" as const },
  { name: "avatar_url", label: "Avatar", type: "file" as const, bucket: "authors" },
  { name: "bio", label: "Bio", type: "textarea" as const },
];

export default async function AuthorsPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const params = parsePageParams(searchParams);
  const { rows, count, page, perPage } = await listAuthors(params);

  const columns: Column<any>[] = [
    { key: "sr", label: "SR No", render: (_r, i) => (page - 1) * perPage + i + 1 },
    {
      key: "name",
      label: "Author Name",
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-brand-50 text-xs font-bold text-brand">
            {r.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              r.name?.charAt(0)
            )}
          </div>
          <span className="font-medium">{r.name}</span>
        </div>
      ),
    },
    { key: "designation", label: "Designation", render: (r) => r.designation || "—" },
    { key: "email", label: "Email", render: (r) => r.email || "—" },
    { key: "country", label: "Country", render: (r) => r.country || "—" },
    {
      key: "action",
      label: "Action",
      className: "text-right",
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <EntityForm
            title="Edit Author"
            fields={fields}
            defaults={r}
            action={updateAuthorAction.bind(null, r.id)}
            trigger={<EditTrigger />}
            wide
          />
          <ConfirmDialog onConfirm={deleteAuthorAction.bind(null, r.id)} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Authors"
        action={<EntityForm title="Add New Author" fields={fields} action={createAuthorAction} wide />}
      />
      <DataTable
        columns={columns}
        rows={rows}
        count={count}
        page={page}
        perPage={perPage}
        searchPlaceholder="Search authors..."
        bulkDelete={bulkDeleteAction.bind(null, "authors", "/admin/authors")}
        bulkLabel="authors"
      />
    </div>
  );
}
