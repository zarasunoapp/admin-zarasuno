import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { EntityForm, EditTrigger } from "@/components/admin/EntityForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { parsePageParams } from "@/lib/utils";
import { listFaqs } from "@/lib/repositories/faqRepository";
import { createFaqAction, updateFaqAction, deleteFaqAction } from "./actions";
import { bulkDeleteAction } from "../bulk-actions";

export const dynamic = "force-dynamic";

const fields = [
  { name: "question", label: "Question", required: true, colSpan: 2 as const },
  { name: "answer", label: "Answer", type: "textarea" as const, required: true },
  { name: "sort_order", label: "Sort Order", type: "number" as const },
  { name: "is_active", label: "Active", type: "toggle" as const },
];

export default async function FaqsPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const params = parsePageParams(searchParams);
  const { rows, count, page, perPage } = await listFaqs(params);

  const columns: Column<any>[] = [
    { key: "sr", label: "SR No", render: (_r, i) => (page - 1) * perPage + i + 1 },
    { key: "question", label: "Title", render: (r) => <span className="font-medium">{r.question}</span> },
    { key: "answer", label: "Description", render: (r) => <span className="line-clamp-2 max-w-md text-muted">{r.answer}</span> },
    {
      key: "action",
      label: "Action",
      className: "text-right",
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <EntityForm
            title="Edit Faq"
            fields={fields}
            defaults={r}
            action={updateFaqAction.bind(null, r.id)}
            trigger={<EditTrigger />}
          />
          <ConfirmDialog onConfirm={deleteFaqAction.bind(null, r.id)} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="FAQ"
        action={<EntityForm title="Add New Faq" fields={fields} action={createFaqAction} />}
      />
      <DataTable
        columns={columns}
        rows={rows}
        count={count}
        page={page}
        perPage={perPage}
        searchPlaceholder="Search FAQs..."
        bulkDelete={bulkDeleteAction.bind(null, "faqs", "/admin/faqs")}
        bulkLabel="FAQs"
      />
    </div>
  );
}
