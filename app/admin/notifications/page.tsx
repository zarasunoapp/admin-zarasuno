import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { EntityForm } from "@/components/admin/EntityForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SelectFilter } from "@/components/admin/Filters";
import { parsePageParams, formatDateTime } from "@/lib/utils";
import { listNotifications } from "@/lib/repositories/notificationRepository";
import { createNotificationAction, deleteNotificationAction } from "./actions";
import { bulkDeleteAction } from "../bulk-actions";

export const dynamic = "force-dynamic";

const audienceOptions = [
  { value: "all", label: "All Users" },
  { value: "non_subscribed", label: "Non Subscribed Users" },
  { value: "specific", label: "Specific User" },
];

const fields = [
  { name: "title", label: "Title", required: true, colSpan: 2 as const },
  { name: "audience", label: "Type", type: "select" as const, options: audienceOptions, required: true },
  { name: "show_in_popup", label: "Show in Popup", type: "toggle" as const },
  { name: "user_id", label: "User ID (if specific)" },
  { name: "image_url", label: "Image", type: "file" as const, bucket: "notification-images" },
  { name: "body", label: "Body", type: "textarea" as const },
];

function audienceLabel(a: string) {
  return audienceOptions.find((o) => o.value === a)?.label || a;
}

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const params = parsePageParams(searchParams);
  const { rows, count, page, perPage } = await listNotifications(params);

  const columns: Column<any>[] = [
    { key: "sr", label: "SR No", render: (_r, i) => (page - 1) * perPage + i + 1 },
    { key: "title", label: "Title", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "body", label: "Body", render: (r) => <span className="line-clamp-1 max-w-xs text-muted">{r.body || "—"}</span> },
    { key: "audience", label: "Type", render: (r) => audienceLabel(r.audience) },
    { key: "created_at", label: "Created At", render: (r) => formatDateTime(r.created_at) },
    {
      key: "action",
      label: "Action",
      className: "text-right",
      render: (r) => <ConfirmDialog onConfirm={deleteNotificationAction.bind(null, r.id)} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Notifications"
        action={<EntityForm title="Add New Notification" fields={fields} action={createNotificationAction} submitLabel="Send" wide />}
      />
      <DataTable
        columns={columns}
        rows={rows}
        count={count}
        page={page}
        perPage={perPage}
        searchPlaceholder="Search notifications..."
        toolbar={<SelectFilter paramKey="type" label="Type" options={audienceOptions} />}
        bulkDelete={bulkDeleteAction.bind(null, "notifications", "/admin/notifications")}
        bulkLabel="notifications"
      />
    </div>
  );
}
