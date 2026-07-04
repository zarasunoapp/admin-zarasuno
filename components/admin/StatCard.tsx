import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "green",
  hint,
}: {
  label: string;
  value: string | number;
  icon?: any;
  accent?: "green" | "gold" | "clay" | "dark";
  hint?: string;
}) {
  const accents: Record<string, string> = {
    green: "bg-grad-green text-white shadow-card",
    gold: "bg-grad-gold text-brand-900 shadow-gold",
    clay: "bg-clay text-white",
    dark: "bg-brand-900 text-white",
  };
  return (
    <div className="group card relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-cardHover">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand-50/70 blur-2xl transition group-hover:bg-brand-100/70" />
      <div className="relative flex items-center gap-4">
        {Icon && (
          <div className={cn("flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl", accents[accent])}>
            <Icon className="h-6 w-6" />
          </div>
        )}
        <div className="min-w-0">
          <div className="text-sm font-medium text-muted">{label}</div>
          <div className="font-display text-2xl font-bold text-ink">{value}</div>
          {hint && <div className="text-xs text-muted">{hint}</div>}
        </div>
      </div>
    </div>
  );
}
