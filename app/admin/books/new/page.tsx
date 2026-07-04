import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { BookForm } from "../BookForm";
import { createBookAction } from "../actions";
import { listAllAuthors } from "@/lib/repositories/authorRepository";
import { listAllPublishers } from "@/lib/repositories/publisherRepository";
import { listAllCategories } from "@/lib/repositories/categoryRepository";
import { listAllSubcategories } from "@/lib/repositories/subcategoryRepository";

export const dynamic = "force-dynamic";

export default async function NewBookPage() {
  const [authors, publishers, categories, subcategories] = await Promise.all([
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
      <PageHeader title="Add New Book" />
      <BookForm
        action={createBookAction}
        authors={authors.map((a: any) => ({ value: a.id, label: a.name }))}
        publishers={publishers.map((p: any) => ({ value: p.id, label: p.name }))}
        categories={categories.map((c: any) => ({ value: c.id, label: c.name }))}
        subcategories={subcategories.map((s: any) => ({ value: s.id, label: s.name, category_id: s.category_id }))}
        submitLabel="Create Book"
      />
    </div>
  );
}
