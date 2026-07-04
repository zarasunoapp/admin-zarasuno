"use client";

import { SlidersHorizontal, CalendarDays } from "lucide-react";
import { useQueryParams } from "./useQueryParams";

export function SelectFilter({
  paramKey,
  label,
  options,
  allLabel = "All",
}: {
  paramKey: string;
  label?: string;
  options: { value: string; label: string }[];
  allLabel?: string;
}) {
  const { get, setParams } = useQueryParams();
  const active = !!get(paramKey);
  return (
    <div
      className={`flex items-center gap-2 rounded-xl border bg-white px-3 py-1.5 text-sm transition ${
        active ? "border-brand/40 ring-2 ring-brand/10" : "border-black/10"
      }`}
    >
      <SlidersHorizontal className="h-3.5 w-3.5 text-brand" />
      {label && <span className="text-muted">{label}</span>}
      <select
        className="cursor-pointer border-0 bg-transparent p-0 pr-6 text-sm font-medium text-ink outline-none focus:ring-0"
        value={get(paramKey)}
        onChange={(e) => setParams({ [paramKey]: e.target.value || null })}
      >
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function DateRangeFilter() {
  const { get, setParams } = useQueryParams();
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-1.5 text-sm text-muted">
      <CalendarDays className="h-3.5 w-3.5 text-brand" />
      <input
        type="date"
        className="border-0 bg-transparent p-0 text-sm text-ink outline-none focus:ring-0"
        value={get("from")}
        onChange={(e) => setParams({ from: e.target.value || null })}
      />
      <span className="text-black/20">—</span>
      <input
        type="date"
        className="border-0 bg-transparent p-0 text-sm text-ink outline-none focus:ring-0"
        value={get("to")}
        onChange={(e) => setParams({ to: e.target.value || null })}
      />
    </div>
  );
}
