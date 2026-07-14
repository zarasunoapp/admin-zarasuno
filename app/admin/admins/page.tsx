import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { EntityForm, EditTrigger } from "@/components/admin/EntityForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";
import { requireSuperAdmin } from "@/lib/auth";
import { listAdmins } from "@/lib/repositories/adminRepository";
import { createAdminAction, updateAdminAction, deleteAdminAction } from "./actions";

export const dynamic = "force-dynamic";

const createFields = [
  { name: "full_name", label: "Full Name" },
  { name: "email", label: "Email", type: "email" as const, required: true },
  { name: "password", label: "Password", type: "password" as const, required: true },
];

const editFields = [
  { name: "full_name", label: "Full Name" },
  { name: "password", label: "New Password (leave blank to keep)", type: "password" as const },
];

export default async function AdminsPage() {
  await requireSuperAdmin();
  const admins = await listAdmins();

  return (
    <div>
      <PageHeader
        title="Admins"
        subtitle="Create and manage admin accounts (super admin only)"
        action={<EntityForm title="Add Admin" fields={createFields} action={createAdminAction} submitLabel="Create Admin" />}
      />

      <div className="card overflow-hidden">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-black/5 bg-ivory/60 text-xs uppercase text-muted">
              <th className="px-5 py-3">#</th>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Created</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a: any, i: number) => (
              <tr key={a.id} className="border-b border-black/5 last:border-0">
                <td className="px-5 py-3.5">{i + 1}</td>
                <td className="px-5 py-3.5 font-medium">{a.full_name || "—"}</td>
                <td className="px-5 py-3.5">{a.email}</td>
                <td className="px-5 py-3.5">
                  {a.role === "superadmin" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 ring-1 ring-inset ring-brand-200">
                      <ShieldCheck className="h-3.5 w-3.5" /> Super Admin
                    </span>
                  ) : (
                    <StatusBadge status="active" />
                  )}
                </td>
                <td className="px-5 py-3.5 text-muted">{formatDate(a.created_at)}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <EntityForm
                      title="Edit Admin"
                      fields={editFields}
                      defaults={a}
                      action={updateAdminAction.bind(null, a.id)}
                      trigger={<EditTrigger />}
                    />
                    {a.role !== "superadmin" && <ConfirmDialog onConfirm={deleteAdminAction.bind(null, a.id)} />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
