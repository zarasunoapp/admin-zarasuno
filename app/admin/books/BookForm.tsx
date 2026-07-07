"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Save } from "lucide-react";
import { FileUploader } from "@/components/admin/FileUploader";

type Option = { value: string; label: string };

export function BookForm({
  action,
  defaults,
  authors,
  publishers,
  categories,
  subcategories,
  submitLabel = "Save Book",
}: {
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  defaults?: any;
  authors: Option[];
  publishers: Option[];
  categories: Option[];
  subcategories: { value: string; label: string; category_id: string }[];
  submitLabel?: string;
}) {
  const meta = defaults?.metadata || {};
  const [category, setCategory] = useState<string>(defaults?.subcategories?.category_id || "");
  const [advanced, setAdvanced] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const filteredSubs = subcategories.filter((s) => !category || s.category_id === category);

  function submit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const res = await action(formData);
      if (res && res.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <form action={submit} className="space-y-6">
      <Section title="Book Details">
        <Field label="Book Title *">
          <input name="title" required defaultValue={defaults?.title} className="input" />
        </Field>
        <Field label="Subtitle">
          <input name="subtitle" defaultValue={defaults?.subtitle} className="input" />
        </Field>
        <Field label="Book Type *">
          <select name="book_type" defaultValue={defaults?.book_type || "summary"} className="input">
            <option value="summary">Summary</option>
            <option value="full">Full</option>
            <option value="ebook">eBook</option>
            <option value="audiobook">Audiobook</option>
          </select>
        </Field>
        <Field label="Description" full>
          <textarea name="description" rows={4} defaultValue={defaults?.description} className="input" />
        </Field>
      </Section>

      <Section title="Authors & Publisher">
        <Field label="Author *">
          <select name="author_id" defaultValue={defaults?.author_id || ""} className="input">
            <option value="">Select...</option>
            {authors.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Author 2">
          <select name="author_2_id" defaultValue={meta.author_2_id || ""} className="input">
            <option value="">None</option>
            {authors.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Author 3">
          <select name="author_3_id" defaultValue={meta.author_3_id || ""} className="input">
            <option value="">None</option>
            {authors.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Author 4">
          <select name="author_4_id" defaultValue={meta.author_4_id || ""} className="input">
            <option value="">None</option>
            {authors.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Publisher">
          <select name="publisher_id" defaultValue={defaults?.publisher_id || ""} className="input">
            <option value="">None</option>
            {publishers.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Year Published">
          <input name="year_published" type="number" defaultValue={defaults?.year_published} className="input" />
        </Field>
        <Field label="Decade Published">
          <input
            name="decade_published"
            defaultValue={meta.decade_published || ""}
            placeholder="e.g. 2020s"
            className="input"
          />
        </Field>
      </Section>

      <Section title="Classification">
        <Field label="Category *">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
            <option value="">Select...</option>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Subcategory *">
          <select name="subcategory_id" defaultValue={defaults?.subcategory_id || ""} className="input">
            <option value="">Select...</option>
            {filteredSubs.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Language *">
          <select name="language_code" defaultValue={defaults?.language_code || "en"} className="input">
            <option value="en">English</option>
            <option value="ur">Urdu</option>
          </select>
        </Field>
      </Section>

      <Section title="Access & Pricing">
        <Field label="Free Book">
          <select name="is_free" defaultValue={defaults?.is_free ? "true" : "false"} className="input">
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </Field>
        <Field label="Coins to Unlock">
          <input name="coin_price" type="number" defaultValue={defaults?.coin_price ?? 0} className="input" />
        </Field>
        <Field label="Show Ads">
          <select name="show_ads" defaultValue={defaults?.show_ads ? "true" : "false"} className="input">
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </Field>
        <Field label="Published">
          <select name="is_published" defaultValue={defaults?.is_published ? "true" : "false"} className="input">
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </Field>
        <Field label="Front Cover">
          <FileUploader bucket="book-covers" name="cover_url" defaultValue={defaults?.cover_url || ""} />
        </Field>
      </Section>

      <div className="card overflow-hidden">
        <button
          type="button"
          onClick={() => setAdvanced((v) => !v)}
          className="flex w-full items-center justify-between px-5 py-4 text-left font-display font-bold text-ink"
        >
          Advanced (Metadata)
          <ChevronDown className={`h-5 w-5 transition ${advanced ? "rotate-180" : ""}`} />
        </button>
        {advanced && (
          <div className="grid grid-cols-1 gap-4 border-t border-black/5 px-5 py-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["isbn10", "ISBN-10"],
              ["isbn13", "ISBN-13"],
              ["edition", "Edition"],
              ["keywords", "Keywords"],
              ["profession", "Profession"],
              ["target_audience", "Target Audience"],
              ["gender", "Gender"],
              ["classification", "Classification"],
              ["original_content", "Original Content / Material Type"],
              ["print_length", "Print Length"],
              ["audiobook_length", "Audiobook Length"],
              ["max_consumption_cap", "Max Consumption Cap"],
              ["country_include", "Country Include"],
              ["country_exclude", "Country Exclude"],
            ].map(([name, label]) => (
              <div key={name}>
                <label className="label">{label}</label>
                <input name={name} defaultValue={meta[name] || ""} className="input" />
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex justify-end gap-3">
        <button type="submit" className="btn-primary" disabled={pending}>
          <Save className="h-4 w-4" />
          {pending ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <h3 className="mb-4 font-display text-base font-bold text-ink">{title}</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
