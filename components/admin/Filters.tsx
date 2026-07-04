"use client";

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
  return (
    <label className="flex items-center gap-2 text-sm text-muted">
      {label && <span>{label}</span>}
      <select
        className="input w-auto py-1.5"
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
    </label>
  );
}

export function DateRangeFilter() {
  const { get, setParams } = useQueryParams();
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
      <input
        type="date"
        className="input w-auto py-1.5"
        value={get("from")}
        onChange={(e) => setParams({ from: e.target.value || null })}
      />
      <span>to</span>
      <input
        type="date"
        className="input w-auto py-1.5"
        value={get("to")}
        onChange={(e) => setParams({ to: e.target.value || null })}
      />
    </div>
  );
}
