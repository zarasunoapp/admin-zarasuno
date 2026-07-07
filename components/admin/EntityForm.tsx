"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { FileUploader } from "./FileUploader";
import { toast } from "@/lib/toast";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "email" | "password" | "number" | "textarea" | "select" | "toggle" | "date" | "datetime-local" | "file";
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  bucket?: string;
  colSpan?: 1 | 2;
};

export function EntityForm({
  title,
  fields,
  action,
  defaults = {},
  trigger,
  submitLabel = "Save",
  wide,
}: {
  title: string;
  fields: Field[];
  action: (formData: FormData) => Promise<{ error?: string } | void>;
  defaults?: Record<string, any>;
  trigger?: React.ReactNode;
  submitLabel?: string;
  wide?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const res = await action(formData);
      if (res && res.error) {
        setError(res.error);
        toast(res.error, "error");
        return;
      }
      setOpen(false);
      toast(`${title} saved`, "success");
      router.refresh();
    });
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>
        {trigger ?? (
          <button className="btn-primary">
            <Plus className="h-4 w-4" />
            {title}
          </button>
        )}
      </span>
      <Modal open={open} onClose={() => setOpen(false)} title={title} wide={wide}>
        <form action={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.name} className={field.colSpan === 2 || field.type === "textarea" ? "sm:col-span-2" : ""}>
              <label className="label">
                {field.label}
                {field.required && <span className="text-red-500"> *</span>}
              </label>
              <FieldInput field={field} defaultValue={defaults[field.name]} />
            </div>
          ))}
          {error && <p className="text-sm text-red-500 sm:col-span-2">{error}</p>}
          <div className="mt-2 flex justify-end gap-3 sm:col-span-2">
            <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={pending}>
              {pending ? "Saving..." : submitLabel}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

function FieldInput({ field, defaultValue }: { field: Field; defaultValue: any }) {
  if (field.type === "textarea") {
    return (
      <textarea
        name={field.name}
        rows={4}
        required={field.required}
        placeholder={field.placeholder}
        defaultValue={defaultValue ?? ""}
        className="input"
      />
    );
  }
  if (field.type === "select") {
    return (
      <select name={field.name} required={field.required} defaultValue={defaultValue ?? ""} className="input">
        <option value="">Select...</option>
        {field.options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }
  if (field.type === "toggle") {
    return (
      <select name={field.name} defaultValue={defaultValue ? "true" : "false"} className="input">
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    );
  }
  if (field.type === "file") {
    return <FileUploader bucket={field.bucket || "uploads"} name={field.name} defaultValue={defaultValue ?? ""} />;
  }
  return (
    <input
      type={field.type || "text"}
      name={field.name}
      required={field.required}
      placeholder={field.placeholder}
      defaultValue={defaultValue ?? ""}
      className="input"
    />
  );
}

export function EditTrigger() {
  return (
    <button className="rounded-lg p-1.5 text-brand transition hover:bg-brand-50">
      <Pencil className="h-4 w-4" />
    </button>
  );
}
