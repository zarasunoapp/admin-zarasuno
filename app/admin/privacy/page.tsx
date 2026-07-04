import { PageHeader } from "@/components/admin/PageHeader";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { getContentPage } from "@/lib/repositories/contentPageRepository";
import { saveContentPageAction } from "../cms-actions";

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const page = await getContentPage("privacy");
  return (
    <div>
      <PageHeader title="Privacy Policy" subtitle="Edit the public privacy policy page" />
      <ContentEditor
        slug="privacy"
        defaultTitle={page?.title || "Privacy Policy"}
        defaultContent={page?.body || ""}
        action={saveContentPageAction}
      />
    </div>
  );
}
