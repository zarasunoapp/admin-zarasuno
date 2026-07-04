"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function RowStatusSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <select
      disabled={pending}
      value={value}
      onChange={(e) => {
        const next = e.target.value;
        startTransition(async () => {
          await onChange(next);
          router.refresh();
        });
      }}
      className="input w-auto py-1.5 text-sm"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
