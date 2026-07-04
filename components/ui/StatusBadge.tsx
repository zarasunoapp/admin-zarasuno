import { cn } from "@/lib/utils";

const MAP: Record<string, string> = {
  active: "bg-brand-50 text-brand-700 ring-brand-200",
  completed: "bg-brand-50 text-brand-700 ring-brand-200",
  resolved: "bg-brand-50 text-brand-700 ring-brand-200",
  approved: "bg-brand-50 text-brand-700 ring-brand-200",
  pending: "bg-gold-50 text-gold-600 ring-gold-200",
  reviewed: "bg-gold-50 text-gold-600 ring-gold-200",
  new: "bg-gold-50 text-gold-600 ring-gold-200",
  inactive: "bg-red-50 text-red-600 ring-red-200",
  failed: "bg-red-50 text-red-600 ring-red-200",
  blocked: "bg-red-50 text-red-600 ring-red-200",
  rejected: "bg-red-50 text-red-600 ring-red-200",
};

export function StatusBadge({ status }: { status: string | null | undefined }) {
  const key = (status || "").toLowerCase();
  const style = MAP[key] || "bg-gray-100 text-gray-600 ring-gray-200";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset",
        style
      )}
    >
      {status || "—"}
    </span>
  );
}
