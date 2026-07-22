import { Smartphone } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { EntityForm, EditTrigger } from "@/components/admin/EntityForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { listHeroFeatures } from "@/lib/repositories/heroFeatureRepository";
import { listAllBooks } from "@/lib/repositories/bookRepository";
import {
  createHeroFeatureAction,
  updateHeroFeatureAction,
  deleteHeroFeatureAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function HeroFeaturePage() {
  const [features, books] = await Promise.all([listHeroFeatures(), listAllBooks()]);
  const bookOptions = books.map((b: any) => ({ value: b.id, label: b.title }));

  const fields = [
    { name: "book_id", label: "Featured Book", type: "select" as const, options: bookOptions, required: true },
    { name: "sample_audio_url", label: "1-min Audio Sample", type: "file" as const, bucket: "hero-samples" },
    { name: "sample_label", label: "Sample Caption", placeholder: "Free 1-min sample" },
    { name: "sort_order", label: "Sort Order", type: "number" as const },
    { name: "is_active", label: "Active (show on website hero)", type: "toggle" as const },
  ];

  return (
    <div>
      <PageHeader
        title="Hero Featured Book"
        subtitle="The book shown inside the phone on the homepage hero + its 1-min sample"
        action={
          <EntityForm
            title="Add Hero Feature"
            fields={fields}
            defaults={{ is_active: true, sample_label: "Free 1-min sample" }}
            action={createHeroFeatureAction}
            wide
          />
        }
      />

      {features.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand">
            <Smartphone className="h-7 w-7" />
          </div>
          <p className="text-muted">No hero feature yet. Pick a book and upload its 1-min sample.</p>
          <EntityForm
            title="Add Hero Feature"
            fields={fields}
            defaults={{ is_active: true, sample_label: "Free 1-min sample" }}
            action={createHeroFeatureAction}
            wide
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {features.map((f: any) => (
            <div key={f.id} className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-black/5 px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <StatusBadge status={f.is_active ? "active" : "inactive"} />
                  <span className="text-xs text-muted">sort {f.sort_order}</span>
                </div>
                <div className="flex items-center gap-1">
                  <EntityForm
                    title="Edit Hero Feature"
                    fields={fields}
                    defaults={f}
                    action={updateHeroFeatureAction.bind(null, f.id)}
                    trigger={<EditTrigger />}
                    wide
                  />
                  <ConfirmDialog onConfirm={deleteHeroFeatureAction.bind(null, f.id)} />
                </div>
              </div>
              <div className="flex gap-4 p-5">
                <div className="h-28 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-ivory">
                  {f.books?.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={f.books.cover_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted">No cover</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-base font-bold text-ink">
                    {f.books?.title || "— (book not found)"}
                  </div>
                  <div className="text-sm text-muted">{f.books?.authors?.name || "Unknown author"}</div>
                  <div className="mt-2 text-xs font-medium text-gold-600">{f.sample_label}</div>
                  {f.sample_audio_url ? (
                    // eslint-disable-next-line jsx-a11y/media-has-caption
                    <audio controls src={f.sample_audio_url} className="mt-2 h-9 w-full max-w-full" />
                  ) : (
                    <div className="mt-2 text-xs text-red-500">No audio sample uploaded</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
