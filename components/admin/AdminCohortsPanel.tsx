"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getDictionary, formatTemplate, type Locale } from "@/lib/i18n/dictionaries";

type CohortUser = { id: string; firstName: string; lastName: string; phone: string };
type Cohort = { id: string; name: string; status: "OPEN" | "CLOSED"; createdAt: string; users: CohortUser[] };

export default function AdminCohortsPanel({ cohorts, locale }: { cohorts: Cohort[]; locale: Locale }) {
  const dict = getDictionary(locale);
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [renameDrafts, setRenameDrafts] = useState<Record<string, string>>({});
  const [moveTargets, setMoveTargets] = useState<Record<string, string>>({});

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await fetch("/api/admin/cohorts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      setNewName("");
      router.refresh();
    } finally {
      setCreating(false);
    }
  }

  async function handleToggle(cohort: Cohort) {
    setBusyId(cohort.id);
    try {
      await fetch(`/api/admin/cohorts/${cohort.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: cohort.status === "OPEN" ? "close" : "open" }),
      });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleRename(cohort: Cohort) {
    const name = renameDrafts[cohort.id]?.trim();
    if (!name || name === cohort.name) return;
    setBusyId(cohort.id);
    try {
      await fetch(`/api/admin/cohorts/${cohort.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleMove(userId: string) {
    const cohortId = moveTargets[userId];
    if (!cohortId) return;
    setBusyId(userId);
    try {
      await fetch(`/api/admin/users/${userId}/cohort`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cohortId }),
      });
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="flex flex-wrap gap-3">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={dict.admin.cohortNamePlaceholder}
          className="flex-1 min-w-[220px] rounded-lg border border-black/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
        />
        <button
          type="submit"
          disabled={creating || !newName.trim()}
          className="rounded-full bg-brand-navy px-5 py-2 text-sm font-semibold text-white hover:bg-brand-navy-light disabled:opacity-50"
        >
          {dict.admin.cohortCreateButton}
        </button>
      </form>

      {cohorts.length === 0 && (
        <div className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-brand-navy/50">{dict.admin.none}</div>
      )}

      <div className="space-y-4">
        {cohorts.map((cohort) => (
          <div key={cohort.id} className="rounded-2xl border border-black/10 bg-white overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-black/5">
              <input
                defaultValue={cohort.name}
                onChange={(e) => setRenameDrafts((prev) => ({ ...prev, [cohort.id]: e.target.value }))}
                className="min-w-[160px] flex-1 rounded-lg border border-black/15 px-3 py-1.5 text-sm font-semibold text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
              />
              <button
                type="button"
                disabled={busyId === cohort.id}
                onClick={() => handleRename(cohort)}
                className="rounded-full border border-black/15 px-3 py-1.5 text-xs font-semibold text-brand-navy hover:border-brand-navy/30 disabled:opacity-50"
              >
                {dict.admin.cohortRenameButton}
              </button>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${
                  cohort.status === "OPEN" ? "bg-green-100 text-green-700" : "bg-black/5 text-brand-navy/50"
                }`}
              >
                {cohort.status === "OPEN" ? dict.admin.cohortOpen : dict.admin.cohortClosed}
              </span>

              <button
                type="button"
                disabled={busyId === cohort.id}
                onClick={() => handleToggle(cohort)}
                className="rounded-full bg-brand-navy px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-navy-light disabled:opacity-50"
              >
                {cohort.status === "OPEN" ? dict.admin.cohortCloseButton : dict.admin.cohortOpenButton}
              </button>

              <span className="ml-auto text-xs font-semibold text-brand-navy/50">
                {formatTemplate(dict.admin.cohortStudentsCount, { count: cohort.users.length })}
              </span>
            </div>

            {cohort.users.length === 0 ? (
              <p className="px-5 py-4 text-sm text-brand-navy/50">{dict.admin.cohortNoStudents}</p>
            ) : (
              <div className="divide-y divide-black/5">
                {cohort.users.map((user) => (
                  <div key={user.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                    <div className="min-w-[140px]">
                      <p className="text-sm font-semibold text-brand-navy">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-brand-navy/60">{user.phone}</p>
                    </div>
                    <select
                      value={moveTargets[user.id] ?? ""}
                      onChange={(e) => setMoveTargets((prev) => ({ ...prev, [user.id]: e.target.value }))}
                      className="ml-auto rounded-lg border border-black/15 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
                    >
                      <option value="">{dict.admin.cohortMoveTo}</option>
                      {cohorts
                        .filter((c) => c.id !== cohort.id)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      disabled={!moveTargets[user.id] || busyId === user.id}
                      onClick={() => handleMove(user.id)}
                      className="rounded-full border border-black/15 px-3 py-1.5 text-xs font-semibold text-brand-navy hover:border-brand-navy/30 disabled:opacity-50"
                    >
                      {dict.admin.cohortMoveButton}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
