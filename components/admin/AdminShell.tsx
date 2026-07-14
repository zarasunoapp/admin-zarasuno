"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Breadcrumbs } from "./Breadcrumbs";

export function AdminShell({
  email,
  role,
  children,
}: {
  email?: string | null;
  role?: string | null;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("zs-sidebar-collapsed");
    if (saved === "1") setCollapsed(true);
  }, []);

  function toggleCollapse() {
    setCollapsed((v) => {
      localStorage.setItem("zs-sidebar-collapsed", v ? "0" : "1");
      return !v;
    });
  }

  return (
    <div className="flex min-h-screen bg-ivory">
      <div className="sticky top-0 hidden h-screen self-start lg:block">
        <Sidebar email={email} role={role} collapsed={collapsed} onToggleCollapse={toggleCollapse} />
      </div>

      <div className={`fixed inset-0 z-50 lg:hidden ${mobileOpen ? "visible" : "invisible"}`}>
        <div
          onClick={() => setMobileOpen(false)}
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            mobileOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute left-0 top-0 h-full shadow-2xl transition-transform duration-300 ease-in-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar mobile email={email} role={role} onClose={() => setMobileOpen(false)} onNavigate={() => setMobileOpen(false)} />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar email={email} onMenu={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6">
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}
