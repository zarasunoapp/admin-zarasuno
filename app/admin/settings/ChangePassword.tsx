"use client";

import { useState } from "react";
import { KeyRound, Eye, EyeOff, Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "@/lib/toast";

export function ChangePassword() {
  const supabase = createSupabaseBrowserClient();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) return toast("Password must be at least 6 characters", "error");
    if (password !== confirm) return toast("Passwords do not match", "error");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast(error.message, "error");
    setPassword("");
    setConfirm("");
    toast("Password updated successfully", "success");
  }

  return (
    <form onSubmit={submit} className="card p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-grad-green text-white">
          <KeyRound className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-base font-bold text-ink">Change Password</h3>
          <p className="text-xs text-muted">Update your admin account password</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">New Password</label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              className="input pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="label">Confirm Password</label>
          <input
            type={show ? "text" : "password"}
            className="input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
          />
        </div>
      </div>
      <div className="mt-4">
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Update Password
        </button>
      </div>
    </form>
  );
}
