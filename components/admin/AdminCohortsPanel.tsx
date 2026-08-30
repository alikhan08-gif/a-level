"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getDictionary, formatTemplate, type Locale } from "@/lib/i18n/dictionaries";

type CohortUser = { id: string; firstName: string; lastName: string; phone: string };
type Cohort = { id: string; name: string; status: "OPEN" | "CLOSED"; createdAt: string; users: CohortUser[] };

const PAGE_SIZE_OPTIONS = [5, 20, 50, 80, 100];

function LockIcon({ locked }: { locked: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d={locked ? "M7 11V7a5 5 0 0 1 10 0v4" : "M7 11V7a5 5 0 0 1 9.9-1"} />
    </svg>
  );
}

export default function AdminCohortsPanel({ cohorts, locale }: { cohorts: Cohort[]; locale: Locale }) {
  const dict = getDictionary(locale);
  const router = useRouter();
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [renameDrafts, setRenameDrafts] = useState<Record<string, string>>({});
  const [moveTargets, setMoveTargets] = useState<Record<string, string>>({});
  const [viewCohortId, setViewCohortId] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(5);

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

  async function handleToggleLock(cohort: Cohort) {
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

  const viewCohort = cohorts.find((c) => c.id === viewCohortId) ?? null;
  const visibleUsers = viewCohort ? viewCohort.users.slice(0, pageSize) : [];

  return (
    <div className="space-y-4">
      {cohorts.length === 0 && (
        <div className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-brand-navy/50">{dict.admin.none}</div>
      )}

      <div className="space-y-3">
        {cohorts.map((cohort) => (
          <div key={cohort.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-black/10 bg-white px-5 py-4">
            <input
              defaultValue={cohort.name}
              onChange={(e) => setRenameDrafts((prev) => ({ ...prev, [cohort.id]: e.target.value }))}
              className="min-w-[140px] flex-1 border-0 border-b border-transparent bg-transparent px-0 py-1 text-sm font-semibold text-brand-navy focus:outline-none focus:border-black/15"
            />
            <button
              type="button"
              disabled={busyId === cohort.id}
              onClick={() => handleRename(cohort)}
              className="rounded-full border border-black/15 px-3 py-1.5 text-xs font-semibold text-brand-navy hover:border-brand-navy/30 disabled:opacity-50"
            >
              {dict.admin.cohortRenameButton}
            </button>

            <button
              type="button"
              disabled={busyId === cohort.id}
              onClick={() => handleToggleLock(cohort)}
              title={cohort.status === "OPEN" ? dict.admin.cohortCloseButton : dict.admin.cohortOpenButton}
              aria-label={cohort.status === "OPEN" ? dict.admin.cohortCloseButton : dict.admin.cohortOpenButton}
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full disabled:opacity-50 ${
                cohort.status === "OPEN" ? "bg-green-100 text-green-700" : "bg-black/5 text-brand-navy/50"
              }`}
            >
              <LockIcon locked={cohort.status !== "OPEN"} />
            </button>

            <span className="text-xs font-semibold text-brand-navy/50">
              {formatTemplate(dict.admin.cohortStudentsCount, { count: cohort.users.length })}
            </span>

            <button
              type="button"
              onClick={() => {
                setViewCohortId(cohort.id);
                setPageSize(5);
              }}
              className="ml-auto rounded-full border border-black/15 px-3 py-1.5 text-xs font-semibold text-brand-navy hover:border-brand-navy/30"
            >
              {dict.admin.cohortViewButton}
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleCreate} className="flex flex-wrap items-center gap-3 rounded-2xl bg-brand-navy px-5 py-4">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={dict.admin.cohortNamePlaceholder}
          className="min-w-[220px] flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
        />
        <button
          type="submit"
          disabled={creating || !newName.trim()}
          className="rounded-full bg-brand-gold px-5 py-2 text-sm font-semibold text-brand-navy hover:brightness-110 disabled:opacity-50"
        >
          {dict.admin.cohortCreateButton}
        </button>
      </form>

      {viewCohort && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setViewCohortId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl bg-white p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-brand-navy">{viewCohort.name}</h3>
              <button
                type="button"
                onClick={() => setViewCohortId(null)}
                aria-label="Yopish"
                className="text-brand-navy/50 hover:text-brand-navy"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <label htmlFor="cohort-page-size" className="text-xs font-semibold text-brand-navy/60">
                {dict.admin.cohortPageSizeLabel}
              </label>
              <input
                id="cohort-page-size"
                type="number"
                min={1}
                list="cohort-page-size-options"
                value={pageSize}
                onChange={(e) => setPageSize(Math.max(1, Number(e.target.value) || 1))}
                className="w-24 rounded-lg border border-black/15 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
              />
              <datalist id="cohort-page-size-options">
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>
            </div>

            {viewCohort.users.length === 0 ? (
              <p className="text-sm text-brand-navy/50">{dict.admin.cohortNoStudents}</p>
            ) : (
              <div className="divide-y divide-black/5">
                {visibleUsers.map((user, index) => (
                  <div key={user.id} className="flex flex-wrap items-center gap-3 py-3">
                    <span className="w-6 shrink-0 text-center text-xs font-bold text-brand-navy/40">{index + 1}</span>
                    <div className="min-w-[120px]">
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
                        .filter((c) => c.id !== viewCohort.id)
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
        </div>
      )}
    </div>
  );
}
