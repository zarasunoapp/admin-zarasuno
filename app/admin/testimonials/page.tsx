import { Star, Quote } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { EntityForm, EditTrigger } from "@/components/admin/EntityForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { listTestimonials } from "@/lib/repositories/testimonialRepository";
import {
  createTestimonialAction,
  updateTestimonialAction,
  deleteTestimonialAction,
} from "./actions";

export const dynamic = "force-dynamic";

const fields = [
  { name: "name", label: "Listener Name", required: true },
  { name: "title", label: "Title / Location (optional)" },
  { name: "rating", label: "Rating (1-5)", type: "number" as const },
  { name: "avatar_url", label: "Photo (optional)", type: "file" as const, bucket: "authors" },
  { name: "message", label: "What they said", type: "textarea" as const, required: true },
  { name: "sort_order", label: "Sort Order", type: "number" as const },
  { name: "is_active", label: "Active (show on website)", type: "toggle" as const },
];

export default async function TestimonialsPage() {
  const testimonials = await listTestimonials();

  return (
    <div>
      <PageHeader
        title="What listeners say about us"
        subtitle="Testimonials shown on the website"
        action={<EntityForm title="Add Testimonial" fields={fields} defaults={{ is_active: true, rating: 5 }} action={createTestimonialAction} wide />}
      />

      {testimonials.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-50 text-gold-600">
            <Quote className="h-7 w-7" />
          </div>
          <p className="text-muted">No testimonials yet. Add what listeners say about ZaraSuno.</p>
          <EntityForm title="Add Testimonial" fields={fields} defaults={{ is_active: true, rating: 5 }} action={createTestimonialAction} wide />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {testimonials.map((t: any) => (
            <div key={t.id} className="card p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-brand-50 text-sm font-bold text-brand">
                    {t.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      (t.name || "?").charAt(0)
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-ink">{t.name}</div>
                    {t.title && <div className="text-xs text-muted">{t.title}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <EntityForm
                    title="Edit Testimonial"
                    fields={fields}
                    defaults={t}
                    action={updateTestimonialAction.bind(null, t.id)}
                    trigger={<EditTrigger />}
                    wide
                  />
                  <ConfirmDialog onConfirm={deleteTestimonialAction.bind(null, t.id)} />
                </div>
              </div>
              <div className="mb-2 flex items-center gap-0.5 text-gold-500">
                {Array.from({ length: Math.max(0, Math.min(5, t.rating || 0)) }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p className="line-clamp-4 text-sm text-ink">“{t.message}”</p>
              <div className="mt-3">
                <StatusBadge status={t.is_active ? "active" : "inactive"} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
