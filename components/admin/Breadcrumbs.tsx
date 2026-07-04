"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { NAV } from "./nav";

const LABELS: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/payments": "Payments",
  "/admin/payments/manual": "Manual Queue",
  "/admin/payments/configs": "Payment Configs",
  "/admin/payments/qr": "Payment QR",
  "/admin/books/new": "Add Book",
  "/admin/reports": "Reports",
};

NAV.forEach((e: any) => {
  if (e.href) LABELS[e.href] = e.label;
  if (e.items) e.items.forEach((i: any) => (LABELS[i.href] = i.label));
});

function humanize(seg: string) {
  return seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs: { href: string; label: string }[] = [];
  let acc = "";
  segments.forEach((seg) => {
    acc += `/${seg}`;
    const isId = /^[0-9a-fA-F-]{16,}$/.test(seg) || /^\d+$/.test(seg);
    if (isId) return;
    crumbs.push({ href: acc, label: LABELS[acc] || humanize(seg) });
  });

  if (pathname === "/admin") return null;

  return (
    <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted">
      <Link href="/admin" className="flex items-center gap-1 transition hover:text-brand">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {crumbs.slice(1).map((c, i, arr) => (
        <span key={c.href} className="flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5 text-muted/60" />
          {i === arr.length - 1 ? (
            <span className="font-semibold text-ink">{c.label}</span>
          ) : (
            <Link href={c.href} className="transition hover:text-brand">
              {c.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
