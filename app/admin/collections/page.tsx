import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { parsePageParams } from "@/lib/utils";
import { listCollections } from "@/lib/repositories/collectionRepository";
import { listAllBooks } from "@/lib/repositories/bookRepository";
import { CollectionForm } from "./CollectionForm";
import {
  createCollectionAction,
  updateCollectionAction,
  deleteCollectionAction,
} from "./actions";
import { bulkDeleteAction } from "../bulk-actions";

export const dynamic = "force-dynamic";

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const params = parsePageParams(searchParams);
  const [{ rows, count, page, perPage }, books] = await Promise.all([
    listCollections(params),
    listAllBooks(),
  ]);
  const bookOptions = books.map((b: any) => ({ value: b.id, label: b.title }));

  const columns: Column<any>[] = [
    { key: "sr", label: "SR No", render: (_r, i) => (page - 1) * perPage + i + 1 },
    { key: "title", label: "Title", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "description", label: "Description", render: (r) => <span className="line-clamp-1 max-w-48 text-muted">{r.description || "—"}</span> },
    {
      key: "books",
      label: "Book List",
      render: (r) => (
        <span className="line-clamp-1 max-w-48 text-muted">
          {(r.collection_books || []).map((cb: any) => cb.books?.title).filter(Boolean).join(", ") || "—"}
        </span>
      ),
    },
    {
      key: "image",
      label: "Image",
      render: (r) =>
        r.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.image_url} alt="" className="h-10 w-16 rounded-md object-cover" />
        ) : (
          "—"
        ),
    },
    {
      key: "action",
      label: "Action",
      className: "text-right",
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <CollectionForm
            title="Edit Collection"
            action={updateCollectionAction.bind(null, r.id)}
            books={bookOptions}
            defaults={r}
            edit
          />
          <ConfirmDialog onConfirm={deleteCollectionAction.bind(null, r.id)} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Collections"
        action={<CollectionForm title="Add Collection" action={createCollectionAction} books={bookOptions} />}
      />
      <DataTable
        columns={columns}
        rows={rows}
        count={count}
        page={page}
        perPage={perPage}
        searchPlaceholder="Search collections..."
        bulkDelete={bulkDeleteAction.bind(null, "collections", "/admin/collections")}
        bulkLabel="collections"
      />
    </div>
  );
}
