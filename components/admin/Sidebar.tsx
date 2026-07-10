"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, PanelLeftClose, PanelLeftOpen, X, LogOut } from "lucide-react";
import { NAV, type NavGroup } from "./nav";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

function isGroup(entry: any): entry is NavGroup {
  return Array.isArray(entry.items);
}

export function Sidebar({
  collapsed = false,
  mobile = false,
  email,
  onToggleCollapse,
  onClose,
  onNavigate,
}: {
  collapsed?: boolean;
  mobile?: boolean;
  email?: string | null;
  onToggleCollapse?: () => void;
  onClose?: () => void;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isCollapsed = collapsed && !mobile;

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className={cn(
        "flex h-full flex-col bg-brand-900 text-white transition-[width] duration-300 ease-in-out",
        isCollapsed ? "w-[76px]" : "w-64"
      )}
    >
      <div className="flex h-20 flex-shrink-0 items-center px-3">
        {isCollapsed ? (
          <button
            onClick={onToggleCollapse}
            title="Expand sidebar"
            className="mx-auto rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <PanelLeftOpen className="h-5 w-5" />
          </button>
        ) : (
          <div className="flex w-full items-center justify-between gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/goldenlogo.png" alt="ZaraSuno" className="h-11 w-auto max-w-[72%] flex-shrink object-contain" />
            {mobile ? (
              <button onClick={onClose} className="flex-shrink-0 rounded-lg p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            ) : (
              <button onClick={onToggleCollapse} title="Collapse sidebar" className="mr-1 flex-shrink-0 rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white">
                <PanelLeftClose className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
      </div>

      <nav className="no-scrollbar flex-1 space-y-1 overflow-y-auto px-3 pb-4 pt-3">
        {NAV.map((entry) =>
          isGroup(entry) ? (
            <NavGroupItem
              key={entry.label}
              group={entry}
              pathname={pathname}
              collapsed={isCollapsed}
              onExpand={onToggleCollapse}
              onNavigate={onNavigate}
            />
          ) : (
            <NavLink
              key={entry.href}
              href={entry.href}
              label={entry.label}
              icon={entry.icon}
              collapsed={isCollapsed}
              onNavigate={onNavigate}
              active={entry.href === "/admin" ? pathname === "/admin" : pathname.startsWith(entry.href)}
            />
          )
        )}
      </nav>

      <div className="flex-shrink-0 border-t border-white/10 p-3">
        {!isCollapsed && email && (
          <div className="mb-2 flex items-center gap-2.5 rounded-xl px-2 py-1.5">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-grad-gold text-sm font-bold text-brand-900">
              {(email || "A").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">Administrator</div>
              <div className="truncate text-xs text-white/50">{email}</div>
            </div>
          </div>
        )}
        <button
          onClick={signOut}
          title="Logout"
          className={cn(
            "flex w-full items-center gap-3 rounded-xl text-sm font-semibold text-white/80 transition hover:bg-red-500/90 hover:text-white",
            isCollapsed ? "justify-center p-2.5" : "px-3 py-2.5"
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

function NavGroupItem({
  group,
  pathname,
  collapsed,
  onExpand,
  onNavigate,
}: {
  group: NavGroup;
  pathname: string;
  collapsed: boolean;
  onExpand?: () => void;
  onNavigate?: () => void;
}) {
  const containsActive = group.items.some((i) => pathname.startsWith(i.href));
  const [open, setOpen] = useState(containsActive);
  const Icon = group.icon;

  if (collapsed) {
    return (
      <button
        onClick={onExpand}
        title={group.label}
        className={cn(
          "flex w-full items-center justify-center rounded-xl p-2.5 transition hover:bg-white/10",
          containsActive ? "text-gold" : "text-white/80"
        )}
      >
        {Icon && <Icon className="h-5 w-5" />}
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-white/10",
          containsActive ? "text-gold" : "text-white/80"
        )}
      >
        {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
        <span className="flex-1 text-left">{group.label}</span>
        <ChevronDown className={cn("h-4 w-4 transition", open && "rotate-180")} />
      </button>
      <div className={cn("grid transition-all duration-300", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <div className="mt-1 space-y-0.5 pl-4">
            {group.items.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={pathname === item.href}
                onNavigate={onNavigate}
                small
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  small,
  collapsed,
  onNavigate,
}: {
  href: string;
  label: string;
  icon?: any;
  active: boolean;
  small?: boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl text-sm font-medium transition",
        collapsed ? "justify-center p-2.5" : "px-3 py-2.5",
        active ? "bg-brand text-white shadow-inner" : "text-white/75 hover:bg-white/10 hover:text-white",
        small && !collapsed && "py-2 text-[13px]"
      )}
    >
      {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}
