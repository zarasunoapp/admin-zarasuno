import { Star } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { RowStatusSelect } from "@/components/admin/RowStatusSelect";
import { SelectFilter } from "@/components/admin/Filters";
import { parsePageParams, formatDateTime } from "@/lib/utils";
import { listFeedback } from "@/lib/repositories/feedbackRepository";
import { setFeedbackStatusAction, deleteFeedbackAction } from "./actions";
import { bulkDeleteAction } from "../bulk-actions";

export const dynamic = "force-dynamic";

const statusOptions = [
  { value: "new", label: "New" },
  { value: "reviewed", label: "Reviewed" },
  { value: "resolved", label: "Resolved" },
];

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const params = parsePageParams(searchParams);
  const { rows, count, page, perPage } = await listFeedback(params);

  const columns: Column<any>[] = [
    { key: "sr", label: "SR No", render: (_r, i) => (page - 1) * perPage + i + 1 },
    { key: "user", label: "User", render: (r) => r.profiles?.full_name || r.profiles?.email || "—" },
    { key: "message", label: "Message", render: (r) => <span className="line-clamp-2 max-w-md">{r.message}</span> },
    {
      key: "rating",
      label: "Rating",
      render: (r) => (
        <span className="inline-flex items-center gap-1 text-gold-600">
          <Star className="h-4 w-4 fill-current" />
          {r.rating ?? "—"}
        </span>
      ),
    },
    { key: "created_at", label: "Date", render: (r) => formatDateTime(r.created_at) },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <RowStatusSelect
          value={r.status || "new"}
          options={statusOptions}
          onChange={setFeedbackStatusAction.bind(null, r.id)}
        />
      ),
    },
    {
      key: "action",
      label: "Action",
      className: "text-right",
      render: (r) => <ConfirmDialog onConfirm={deleteFeedbackAction.bind(null, r.id)} />,
    },
  ];

  return (
    <div>
      <PageHeader title="Feedback" subtitle="User feedback and ratings" />
      <DataTable
        columns={columns}
        rows={rows}
        count={count}
        page={page}
        perPage={perPage}
        searchPlaceholder="Search feedback..."
        toolbar={<SelectFilter paramKey="status" label="Status" options={statusOptions} />}
        bulkDelete={bulkDeleteAction.bind(null, "feedback", "/admin/feedback")}
        bulkLabel="feedback"
      />
    </div>
  );
}
