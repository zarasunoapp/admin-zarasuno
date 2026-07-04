import { LayoutTemplate, GalleryHorizontalEnd } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Tabs } from "@/components/admin/Tabs";
import { HeroTab } from "./HeroTab";
import { CarouselsTab } from "./CarouselsTab";
import { getHomeHero, listCarousels } from "@/lib/repositories/homeScreenRepository";
import { listAllCategories } from "@/lib/repositories/categoryRepository";
import { listCollections } from "@/lib/repositories/collectionRepository";
import { listAllBooks } from "@/lib/repositories/bookRepository";

export const dynamic = "force-dynamic";

export default async function HomeScreenPage() {
  const [hero, carousels, categories, collectionsRes, books] = await Promise.all([
    getHomeHero(),
    listCarousels(),
    listAllCategories(),
    listCollections({ page: 1, perPage: 100 }),
    listAllBooks(),
  ]);

  const catOptions = categories.map((c: any) => ({ value: c.id, label: c.name }));
  const colOptions = collectionsRes.rows.map((c: any) => ({ value: c.id, label: c.title }));
  const bookOptions = books.map((b: any) => ({ value: b.id, label: b.title }));

  return (
    <div>
      <PageHeader title="Home Screen" subtitle="Landing hero and home carousels for the public site" />
      <Tabs
        tabs={[
          { label: "Landing / Hero", icon: <LayoutTemplate className="h-4 w-4" />, content: <HeroTab hero={hero} /> },
          {
            label: "Carousels",
            icon: <GalleryHorizontalEnd className="h-4 w-4" />,
            content: (
              <CarouselsTab
                carousels={carousels}
                categories={catOptions}
                collections={colOptions}
                books={bookOptions}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
