"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQueryParams } from "./useQueryParams";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  perPage,
  count,
}: {
  page: number;
  perPage: number;
  count: number;
}) {
  const { setParams } = useQueryParams();
  const totalPages = Math.max(1, Math.ceil(count / perPage));
  const start = count === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(count, page * perPage);

  const pages: number[] = [];
  const from = Math.max(1, page - 2);
  const to = Math.min(totalPages, from + 4);
  for (let i = from; i <= to; i++) pages.push(i);

  return (
    <div className="flex flex-col items-center justify-between gap-3 px-5 py-4 text-sm text-muted sm:flex-row">
      <span>
        {start}–{end} of {count}
      </span>
      <div className="flex items-center gap-1">
        <button
          disabled={page <= 1}
          onClick={() => setParams({ page: page - 1 })}
          className="rounded-lg border border-black/10 p-2 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => setParams({ page: p })}
            className={cn(
              "h-9 min-w-9 rounded-lg border px-3 text-sm font-medium",
              p === page
                ? "border-brand bg-brand text-white"
                : "border-black/10 text-ink hover:bg-ivory"
            )}
          >
            {p}
          </button>
        ))}
        <button
          disabled={page >= totalPages}
          onClick={() => setParams({ page: page + 1 })}
          className="rounded-lg border border-black/10 p-2 disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
