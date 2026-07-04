import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "-";
  const d = new Date(value);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) return "-";
  const d = new Date(value);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatMoney(value: number | null | undefined, currency = "PKR") {
  if (value == null) return "-";
  return `${currency} ${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatNumber(value: number | null | undefined) {
  if (value == null) return "0";
  return Number(value).toLocaleString("en-US");
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function parsePageParams(searchParams: Record<string, string | string[] | undefined>) {
  const get = (k: string) => {
    const v = searchParams[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const page = Math.max(1, parseInt(get("page") || "1", 10) || 1);
  const perPage = Math.min(100, Math.max(5, parseInt(get("perPage") || "10", 10) || 10));
  const q = (get("q") || "").trim();
  const sort = get("sort") || undefined;
  const dir = (get("dir") as "asc" | "desc") || "desc";
  const from = get("from") || undefined;
  const to = get("to") || undefined;
  const type = get("type") || undefined;
  const status = get("status") || undefined;
  const filter = get("filter") || undefined;
  return { page, perPage, q, sort, dir, from, to, type, status, filter };
}

export function buildRange(page: number, perPage: number) {
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  return { from, to };
}
