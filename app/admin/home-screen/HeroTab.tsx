"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Save } from "lucide-react";
import { FileUploader } from "@/components/admin/FileUploader";
import { saveHomeHeroAction } from "./actions";

export function HeroTab({ hero }: { hero: Record<string, any> }) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  function submit(formData: FormData) {
    setError("");
    setSaved(false);
    startTransition(async () => {
      const res = await saveHomeHeroAction(formData);
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
        <label className="label">Title</label>
        <input name="title" defaultValue={hero.title} className="input" />
      </div>
      <div>
        <label className="label">Hero Section Enabled</label>
        <select name="enabled" defaultValue={hero.enabled ? "true" : "false"} className="input">
          <option value="true">On</option>
          <option value="false">Off</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="label">Hero Section Title</label>
        <textarea name="hero_title" rows={2} defaultValue={hero.hero_title} className="input" />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Hero Section Description</label>
        <textarea name="hero_description" rows={3} defaultValue={hero.hero_description} className="input" />
      </div>
      <div>
        <label className="label">Button One Text</label>
        <input name="button_one_text" defaultValue={hero.button_one_text} className="input" />
      </div>
      <div>
        <label className="label">Button One Link</label>
        <input name="button_one_link" defaultValue={hero.button_one_link} className="input" />
      </div>
      <div>
        <label className="label">Button Two Text</label>
        <input name="button_two_text" defaultValue={hero.button_two_text} className="input" />
      </div>
      <div>
        <label className="label">Button Two Link</label>
        <input name="button_two_link" defaultValue={hero.button_two_link} className="input" />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Hero Section Image</label>
        <FileUploader bucket="home-hero" name="image_url" defaultValue={hero.image_url || ""} />
      </div>
      <div className="flex items-center gap-3 sm:col-span-2">
        <button type="submit" className="btn-primary" disabled={pending}>
          <Save className="h-4 w-4" />
          {pending ? "Saving..." : "Save Hero"}
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
