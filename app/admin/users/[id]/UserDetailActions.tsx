"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Plus } from "lucide-react";
import { grantBookAccessAction, setUserRoleAction } from "../actions";

export function GrantBookAccess({
  userId,
  books,
}: {
  userId: string;
  books: { id: string; title: string }[];
}) {
  const [bookId, setBookId] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function grant() {
    if (!bookId) return;
    startTransition(async () => {
      await grantBookAccessAction(userId, bookId);
      setBookId("");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select className="input" value={bookId} onChange={(e) => setBookId(e.target.value)}>
        <option value="">Select a book...</option>
        {books.map((b) => (
          <option key={b.id} value={b.id}>
            {b.title}
          </option>
        ))}
      </select>
      <button className="btn-primary flex-shrink-0" disabled={pending || !bookId} onClick={grant}>
        <Plus className="h-4 w-4" /> Grant
      </button>
    </div>
  );
}

export function ToggleAdminRole({ userId, isAdmin }: { userId: string; isAdmin: boolean }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function toggle() {
    startTransition(async () => {
      await setUserRoleAction(userId, isAdmin ? "user" : "admin");
      router.refresh();
    });
  }

  return (
    <button className="btn-ghost" disabled={pending} onClick={toggle}>
      <ShieldCheck className="h-4 w-4" />
      {isAdmin ? "Revoke Admin" : "Make Admin"}
    </button>
  );
}
