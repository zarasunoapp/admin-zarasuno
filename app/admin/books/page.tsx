import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { SelectFilter } from "@/components/admin/Filters";
import { Toggle } from "@/components/ui/Toggle";
import { parsePageParams } from "@/lib/utils";
import { listBooks } from "@/lib/repositories/bookRepository";
import { BookRowActions } from "./BookRowActions";
import { toggleBookFlagAction } from "./actions";
import { bulkDeleteAction } from "../bulk-actions";

export const dynamic = "force-dynamic";

const typeOptions = [
  { value: "summary", label: "Summary" },
  { value: "full", label: "Full" },
  { value: "ebook", label: "eBook" },
  { value: "audiobook", label: "Audiobook" },
  { value: "free", label: "Free" },
  { value: "premium", label: "Premium" },
];

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const params = parsePageParams(searchParams);
  const { rows, count, page, perPage } = await listBooks(params);

  const columns: Column<any>[] = [
    { key: "sr", label: "SR No", render: (_r, i) => (page - 1) * perPage + i + 1 },
    {
      key: "image",
      label: "Image",
      render: (r) => (
        <div className="h-12 w-9 overflow-hidden rounded-md bg-ivory">
          {r.cover_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={r.cover_url} alt="" className="h-full w-full object-cover" />
          )}
        </div>
      ),
    },
    { key: "title", label: "Book Name", render: (r) => <span className="font-medium">{r.title}</span> },
    { key: "author", label: "Author", render: (r) => r.authors?.name || "—" },
    {
      key: "bod",
      label: "Book of the Day",
      render: (r) => (
        <Toggle checked={!!r.is_book_of_day} onToggle={toggleBookFlagAction.bind(null, r.id, "is_book_of_day")} />
      ),
    },
    {
      key: "top",
      label: "Top Selling",
      render: (r) => (
        <Toggle checked={!!r.is_top_selling} onToggle={toggleBookFlagAction.bind(null, r.id, "is_top_selling")} />
      ),
    },
    {
      key: "rec",
      label: "Recommended",
      render: (r) => (
        <Toggle checked={!!r.is_recommended} onToggle={toggleBookFlagAction.bind(null, r.id, "is_recommended")} />
      ),
    },
    {
      key: "action",
      label: "Action",
      className: "text-right",
      render: (r) => <BookRowActions id={r.id} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Books"
        action={
          <Link href="/admin/books/new" className="btn-primary">
            <Plus className="h-4 w-4" /> Add New Book
          </Link>
        }
      />
      <DataTable
        columns={columns}
        rows={rows}
        count={count}
        page={page}
        perPage={perPage}
        searchPlaceholder="Search books..."
        toolbar={<SelectFilter paramKey="type" label="Book Type" options={typeOptions} allLabel="All" />}
        bulkDelete={bulkDeleteAction.bind(null, "books", "/admin/books")}
        bulkLabel="books"
      />
    </div>
  );
}
