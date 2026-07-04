import { PageHeader } from "@/components/admin/PageHeader";
import { SettingsForm } from "./SettingsForm";
import { ChangePassword } from "./ChangePassword";
import { getAllSettings } from "@/lib/repositories/settingsRepository";
import { saveSettingsAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getAllSettings();
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Global app configuration" />
      <SettingsForm settings={settings} action={saveSettingsAction} />
      <ChangePassword />
    </div>
  );
}
