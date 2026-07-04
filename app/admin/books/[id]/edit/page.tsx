import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { BookForm } from "../../BookForm";
import { ChaptersManager } from "./ChaptersManager";
import { updateBookAction } from "../../actions";
import { getBook } from "@/lib/repositories/bookRepository";
import { listChaptersByBook } from "@/lib/repositories/chapterRepository";
import { listAllAuthors } from "@/lib/repositories/authorRepository";
import { listAllPublishers } from "@/lib/repositories/publisherRepository";
import { listAllCategories } from "@/lib/repositories/categoryRepository";
import { listAllSubcategories } from "@/lib/repositories/subcategoryRepository";

export const dynamic = "force-dynamic";

export default async function EditBookPage({ params }: { params: { id: string } }) {
  const book = await getBook(params.id);
  if (!book) notFound();

  const [chapters, authors, publishers, categories, subcategories] = await Promise.all([
    listChaptersByBook(params.id),
    listAllAuthors(),
    listAllPublishers(),
    listAllCategories(),
    listAllSubcategories(),
  ]);

  return (
    <div>
      <Link href="/admin/books" className="mb-4 inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to Books
      </Link>
      <PageHeader title="Edit Book" subtitle={book.title} />
      <div className="space-y-6">
        <BookForm
          action={updateBookAction.bind(null, params.id)}
          defaults={book}
          authors={authors.map((a: any) => ({ value: a.id, label: a.name }))}
          publishers={publishers.map((p: any) => ({ value: p.id, label: p.name }))}
          categories={categories.map((c: any) => ({ value: c.id, label: c.name }))}
          subcategories={subcategories.map((s: any) => ({ value: s.id, label: s.name, category_id: s.category_id }))}
        />
        <ChaptersManager bookId={params.id} chapters={chapters} />
      </div>
    </div>
  );
}
