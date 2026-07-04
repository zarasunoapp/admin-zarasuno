"use client";

import { useState } from "react";
import { Check } from "lucide-react";

export function MultiSelect({
  name,
  options,
  defaultSelected = [],
}: {
  name: string;
  options: { value: string; label: string }[];
  defaultSelected?: string[];
}) {
  const [selected, setSelected] = useState<string[]>(defaultSelected);
  const [query, setQuery] = useState("");

  function toggle(value: string) {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <input type="hidden" name={name} value={selected.join(",")} />
      <input
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="input mb-2"
      />
      <div className="max-h-52 space-y-1 overflow-y-auto rounded-xl border border-black/10 p-2">
        {filtered.map((o) => {
          const isOn = selected.includes(o.value);
          return (
            <button
              type="button"
              key={o.value}
              onClick={() => toggle(o.value)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                isOn ? "bg-brand-50 text-brand-700" : "hover:bg-ivory"
              }`}
            >
              <span>{o.label}</span>
              {isOn && <Check className="h-4 w-4" />}
            </button>
          );
        })}
        {filtered.length === 0 && <p className="px-3 py-2 text-sm text-muted">No matches.</p>}
      </div>
      <p className="mt-1.5 text-xs text-muted">{selected.length} selected</p>
    </div>
  );
}
