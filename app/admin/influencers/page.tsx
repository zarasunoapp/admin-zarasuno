import { Megaphone } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { EntityForm, EditTrigger } from "@/components/admin/EntityForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatDate } from "@/lib/utils";
import { listInfluencers } from "@/lib/repositories/influencerRepository";
import {
  createInfluencerAction,
  updateInfluencerAction,
  deleteInfluencerAction,
} from "./actions";

export const dynamic = "force-dynamic";

const createFields = [
  { name: "name", label: "Influencer Name", required: true },
  { name: "email", label: "Email (portal login)", type: "email" as const, required: true },
  { name: "password", label: "Portal Login Password", type: "password" as const, required: true },
  { name: "commission_percent", label: "Commission %", type: "number" as const },
];

const editFields = [
  { name: "name", label: "Influencer Name" },
  { name: "commission_percent", label: "Commission %", type: "number" as const },
  { name: "password", label: "New Password (blank = keep)", type: "password" as const },
];

export default async function InfluencersPage() {
  const influencers = await listInfluencers();

  return (
    <div>
      <PageHeader
        title="Influencers"
        subtitle="Create influencer accounts, set commission %, assign promocodes (in Promocode tab)"
        action={<EntityForm title="Add Influencer" fields={createFields} action={createInfluencerAction} submitLabel="Create Influencer" />}
      />

      {influencers.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-50 text-gold-600">
            <Megaphone className="h-7 w-7" />
          </div>
          <p className="text-muted">No influencers yet. Create one and assign promocodes to them.</p>
          <EntityForm title="Add Influencer" fields={createFields} action={createInfluencerAction} submitLabel="Create Influencer" />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-black/5 bg-ivory/60 text-xs uppercase text-muted">
                <th className="px-5 py-3">#</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Commission</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {influencers.map((inf: any, i: number) => (
                <tr key={inf.id} className="border-b border-black/5 last:border-0">
                  <td className="px-5 py-3.5">{i + 1}</td>
                  <td className="px-5 py-3.5 font-medium">{inf.name}</td>
                  <td className="px-5 py-3.5">{inf.email}</td>
                  <td className="px-5 py-3.5 font-semibold text-brand">{inf.commission_percent || 0}%</td>
                  <td className="px-5 py-3.5 text-muted">{formatDate(inf.created_at)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <EntityForm
                        title="Edit Influencer"
                        fields={editFields}
                        defaults={inf}
                        action={updateInfluencerAction.bind(null, inf.id)}
                        trigger={<EditTrigger />}
                      />
                      <ConfirmDialog onConfirm={deleteInfluencerAction.bind(null, inf.id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
