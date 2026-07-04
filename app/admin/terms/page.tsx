import { PageHeader } from "@/components/admin/PageHeader";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { getContentPage } from "@/lib/repositories/contentPageRepository";
import { saveContentPageAction } from "../cms-actions";

export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const page = await getContentPage("terms");
  return (
    <div>
      <PageHeader title="Terms & Conditions" subtitle="Edit the public terms page" />
      <ContentEditor
        slug="terms"
        defaultTitle={page?.title || "Terms & Conditions"}
        defaultContent={page?.body || ""}
        action={saveContentPageAction}
      />
    </div>
  );
}
