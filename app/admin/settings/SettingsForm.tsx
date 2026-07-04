"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Save } from "lucide-react";
import { FileUploader } from "@/components/admin/FileUploader";

export function SettingsForm({
  settings,
  action,
}: {
  settings: Record<string, any>;
  action: (formData: FormData) => Promise<{ error?: string } | void>;
}) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const socials = settings.socials || {};

  function submit(formData: FormData) {
    setError("");
    setSaved(false);
    startTransition(async () => {
      const res = await action(formData);
      if (res && res.error) setError(res.error);
      else {
        setSaved(true);
        router.refresh();
      }
    });
  }

  return (
    <form action={submit} className="card grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
      <div>
        <label className="label">Brand Name</label>
        <input name="brand_name" defaultValue={settings.brand_name} className="input" />
      </div>
      <div>
        <label className="label">Contact Email</label>
        <input name="contact_email" type="email" defaultValue={settings.contact_email} className="input" />
      </div>
      <div>
        <label className="label">Primary Color</label>
        <input name="primary_color" defaultValue={settings.primary_color || "#0B5D4B"} className="input" />
      </div>
      <div>
        <label className="label">Accent Color</label>
        <input name="accent_color" defaultValue={settings.accent_color || "#D9A94C"} className="input" />
      </div>
      <div>
        <label className="label">Signup Free Coins</label>
        <input name="signup_free_coins" type="number" defaultValue={settings.signup_free_coins ?? 0} className="input" />
      </div>
      <div>
        <label className="label">Logo</label>
        <FileUploader bucket="settings" name="logo_url" defaultValue={settings.logo_url || ""} label="Upload Logo" />
      </div>
      <div>
        <label className="label">Facebook</label>
        <input name="facebook" defaultValue={socials.facebook} className="input" />
      </div>
      <div>
        <label className="label">Instagram</label>
        <input name="instagram" defaultValue={socials.instagram} className="input" />
      </div>
      <div>
        <label className="label">Twitter / X</label>
        <input name="twitter" defaultValue={socials.twitter} className="input" />
      </div>
      <div className="flex items-center gap-3 sm:col-span-2">
        <button type="submit" className="btn-primary" disabled={pending}>
          <Save className="h-4 w-4" />
          {pending ? "Saving..." : "Save Settings"}
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1 text-sm text-brand">
            <CheckCircle2 className="h-4 w-4" /> Saved
          </span>
        )}
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>
    </form>
  );
}
