import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { EntityForm, EditTrigger } from "@/components/admin/EntityForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SelectFilter } from "@/components/admin/Filters";
import { parsePageParams } from "@/lib/utils";
import { listSubcategories } from "@/lib/repositories/subcategoryRepository";
import { listAllCategories } from "@/lib/repositories/categoryRepository";
import {
  createSubcategoryAction,
  updateSubcategoryAction,
  deleteSubcategoryAction,
} from "./actions";
import { bulkDeleteAction } from "../bulk-actions";

export const dynamic = "force-dynamic";

export default async function SubcategoriesPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const params = parsePageParams(searchParams);
  const [{ rows, count, page, perPage }, categories] = await Promise.all([
    listSubcategories(params),
    listAllCategories(),
  ]);

  const catOptions = categories.map((c: any) => ({ value: c.id, label: c.name }));
  const fields = [
    { name: "name", label: "Subcategory Name", required: true },
    { name: "category_id", label: "Category", type: "select" as const, options: catOptions, required: true },
    { name: "slug", label: "Slug (auto)" },
    { name: "sort_order", label: "Sort Order", type: "number" as const },
  ];

  const columns: Column<any>[] = [
    { key: "sr", label: "SR No", render: (_r, i) => (page - 1) * perPage + i + 1 },
    { key: "name", label: "Subcategory Name" },
    { key: "category", label: "Category Name", render: (r) => r.categories?.name || "—" },
    {
      key: "action",
      label: "Action",
      className: "text-right",
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <EntityForm
            title="Edit Subcategory"
            fields={fields}
            defaults={r}
            action={updateSubcategoryAction.bind(null, r.id)}
            trigger={<EditTrigger />}
          />
          <ConfirmDialog onConfirm={deleteSubcategoryAction.bind(null, r.id)} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Subcategories"
        action={<EntityForm title="Add New Subcategory" fields={fields} action={createSubcategoryAction} />}
      />
      <DataTable
        columns={columns}
        rows={rows}
        count={count}
        page={page}
        perPage={perPage}
        searchPlaceholder="Search subcategories..."
        toolbar={<SelectFilter paramKey="filter" label="Category" options={catOptions} />}
        bulkDelete={bulkDeleteAction.bind(null, "subcategories", "/admin/subcategories")}
        bulkLabel="subcategories"
      />
    </div>
  );
}
