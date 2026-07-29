"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";

type LockedUser = { id: string; firstName: string; lastName: string; phone: string };

export default function AdminLockedUsersPanel({ users, locale }: { users: LockedUser[]; locale: Locale }) {
  const dict = getDictionary(locale);
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleUnlock(id: string) {
    setLoadingId(id);
    try {
      await fetch(`/api/admin/users/${id}/unlock`, { method: "POST" });
      router.refresh();
    } finally {
      setLoadingId(null);
    }
  }

  if (users.length === 0) {
    return <div className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-brand-navy/50">{dict.admin.none}</div>;
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white divide-y divide-black/5">
      {users.map((user) => (
        <div key={user.id} className="flex items-center justify-between px-5 py-3">
          <div>
            <p className="text-sm font-semibold text-brand-navy">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-brand-navy/60">{user.phone}</p>
          </div>
          <button
            type="button"
            disabled={loadingId === user.id}
            onClick={() => handleUnlock(user.id)}
            className="rounded-full bg-brand-navy px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-navy-light disabled:opacity-50"
          >
            {loadingId === user.id ? "..." : dict.admin.unlockButton}
          </button>
        </div>
      ))}
    </div>
  );
}
