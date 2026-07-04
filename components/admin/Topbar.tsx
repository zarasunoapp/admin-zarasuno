"use client";

import { LogOut, Menu } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function Topbar({ email, onMenu }: { email?: string | null; onMenu?: () => void }) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initial = (email || "A").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-black/5 bg-white/80 px-6 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenu}
          className="rounded-xl p-2 text-ink transition hover:bg-ivory lg:hidden"
          title="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="font-display text-lg font-bold text-ink">Admin Panel</div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-grad-green text-sm font-bold text-white">
            {initial}
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold text-ink">Administrator</div>
            <div className="text-xs text-muted">{email}</div>
          </div>
        </div>
        <button
          onClick={signOut}
          className="rounded-xl p-2 text-muted transition hover:bg-ivory hover:text-red-500"
          title="Sign out"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
