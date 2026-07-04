"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useQueryParams } from "./useQueryParams";

export function TableToolbar({
  children,
  action,
  placeholder = "Search...",
}: {
  children?: React.ReactNode;
  action?: React.ReactNode;
  placeholder?: string;
}) {
  const { get, setParams } = useQueryParams();
  const [value, setValue] = useState(get("q"));
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      if (value !== get("q")) setParams({ q: value });
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="flex flex-col gap-3 border-b border-black/5 px-5 py-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-muted">
          Show
          <select
            className="input w-auto py-1.5"
            value={get("perPage") || "10"}
            onChange={(e) => setParams({ perPage: e.target.value })}
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          entries
        </label>
        {children}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="input w-full pl-9 pr-8 md:w-64"
          />
          {value && (
            <button
              onClick={() => {
                setValue("");
                setParams({ q: null });
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted transition hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {action}
      </div>
    </div>
  );
}
