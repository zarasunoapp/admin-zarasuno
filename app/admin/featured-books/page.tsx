import { Star } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { EntityForm, EditTrigger } from "@/components/admin/EntityForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { listFeaturedBooks } from "@/lib/repositories/featuredBookRepository";
import { listAllBooks } from "@/lib/repositories/bookRepository";
import {
  createFeaturedBookAction,
  updateFeaturedBookAction,
  deleteFeaturedBookAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function FeaturedBooksPage() {
  const [featured, books] = await Promise.all([listFeaturedBooks(), listAllBooks()]);
  const bookOptions = books.map((b: any) => ({ value: b.id, label: b.title }));

  const fields = [
    { name: "book_id", label: "Linked Book (optional)", type: "select" as const, options: bookOptions },
    { name: "title", label: "Title / Caption" },
    { name: "image_url", label: "Featured Image", type: "file" as const, bucket: "book-covers" },
    { name: "sort_order", label: "Sort Order", type: "number" as const },
    { name: "is_active", label: "Active (show on website)", type: "toggle" as const },
  ];

  const bookTitle = (id: string) => books.find((b: any) => b.id === id)?.title;

  return (
    <div>
      <PageHeader
        title="Featured Books"
        subtitle="Upload images for the featured books section on the website"
        action={
          <EntityForm
            title="Add Featured Book"
            fields={fields}
            defaults={{ is_active: true }}
            action={createFeaturedBookAction}
            wide
          />
        }
      />

      {featured.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-50 text-gold-600">
            <Star className="h-7 w-7" />
          </div>
          <p className="text-muted">No featured books yet. Add one and upload its image.</p>
          <EntityForm title="Add Featured Book" fields={fields} defaults={{ is_active: true }} action={createFeaturedBookAction} wide />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...featured]
            .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
            .map((f: any) => (
              <div key={f.id} className="card overflow-hidden">
                <div className="aspect-[3/4] w-full bg-ivory">
                  {f.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={f.image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted">No image</div>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 p-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-ink">
                      {f.title || bookTitle(f.book_id) || "Untitled"}
                    </div>
                    <StatusBadge status={f.is_active ? "active" : "inactive"} />
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1">
                    <EntityForm
                      title="Edit Featured Book"
                      fields={fields}
                      defaults={f}
                      action={updateFeaturedBookAction.bind(null, f.id)}
                      trigger={<EditTrigger />}
                      wide
                    />
                    <ConfirmDialog onConfirm={deleteFeaturedBookAction.bind(null, f.id)} />
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
