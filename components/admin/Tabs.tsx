"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function Tabs({ tabs }: { tabs: { label: string; icon?: React.ReactNode; content: React.ReactNode }[] }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="mb-6 inline-flex flex-wrap gap-1 rounded-2xl bg-white p-1.5 shadow-card ring-1 ring-black/5">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setActive(i)}
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200",
              active === i
                ? "bg-grad-green text-white shadow-md"
                : "text-muted hover:bg-ivory hover:text-ink"
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>
      <div className="animate-toast-in">{tabs[active].content}</div>
    </div>
  );
}
