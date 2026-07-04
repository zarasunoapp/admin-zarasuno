import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { EntityForm, EditTrigger } from "@/components/admin/EntityForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Toggle } from "@/components/ui/Toggle";
import { parsePageParams } from "@/lib/utils";
import { listCategories } from "@/lib/repositories/categoryRepository";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  toggleCategoryAction,
} from "./actions";
import { bulkDeleteAction } from "../bulk-actions";

export const dynamic = "force-dynamic";

const fields = [
  { name: "name", label: "Category Name", required: true },
  { name: "slug", label: "Slug (auto)", placeholder: "leave blank to auto-generate" },
  { name: "icon_url", label: "Icon", type: "file" as const, bucket: "category-icons" },
  { name: "sort_order", label: "Sort Order", type: "number" as const },
  { name: "is_active", label: "Active", type: "toggle" as const },
];

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const params = parsePageParams(searchParams);
  const { rows, count, page, perPage } = await listCategories(params);

  const columns: Column<any>[] = [
    { key: "sr", label: "SR No", render: (_r, i) => (page - 1) * perPage + i + 1 },
    { key: "name", label: "Category Name" },
    {
      key: "is_active",
      label: "Active",
      render: (r) => (
        <Toggle checked={!!r.is_active} onToggle={toggleCategoryAction.bind(null, r.id)} />
      ),
    },
    {
      key: "action",
      label: "Action",
      className: "text-right",
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <EntityForm
            title="Edit Category"
            fields={fields}
            defaults={r}
            action={updateCategoryAction.bind(null, r.id)}
            trigger={<EditTrigger />}
          />
          <ConfirmDialog onConfirm={deleteCategoryAction.bind(null, r.id)} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Categories"
        action={<EntityForm title="Add New Category" fields={fields} action={createCategoryAction} />}
      />
      <DataTable
        columns={columns}
        rows={rows}
        count={count}
        page={page}
        perPage={perPage}
        searchPlaceholder="Search categories..."
        bulkDelete={bulkDeleteAction.bind(null, "categories", "/admin/categories")}
        bulkLabel="categories"
      />
    </div>
  );
}
