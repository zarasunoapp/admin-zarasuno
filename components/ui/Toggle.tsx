"use client";

import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";

export function Toggle({
  checked,
  onToggle,
  disabled,
}: {
  checked: boolean;
  onToggle: (next: boolean) => Promise<void> | void;
  disabled?: boolean;
}) {
  const [on, setOn] = useState(checked);
  const [pending, startTransition] = useTransition();

  function handle() {
    const next = !on;
    setOn(next);
    startTransition(async () => {
      try {
        await onToggle(next);
      } catch {
        setOn(!next);
      }
    });
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled || pending}
      onClick={handle}
      className={cn(
        "relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition disabled:opacity-60",
        on ? "bg-brand" : "bg-gray-300"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow transition",
          on ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}
