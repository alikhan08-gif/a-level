"use client";

import { useState } from "react";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";

type Course = { id: string; title: string; direction: string; subject: string };

export default function AdminEnrollForm({ courses, locale }: { courses: Course[]; locale: Locale }) {
  const dict = getDictionary(locale);
  const [phone, setPhone] = useState("");
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, courseId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? dict.bookOrder.genericError);
      setMessage({ type: "ok", text: dict.admin.enrolledSuccess });
      setPhone("");
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : dict.bookOrder.genericError });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-black/10 bg-white p-5 flex flex-wrap gap-3 items-end">
      {message && (
        <div
          className={`w-full rounded-lg text-sm px-3 py-2 ${
            message.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}
      <div className="flex-1 min-w-[180px]">
        <label className="block text-xs font-medium text-brand-navy/70 mb-1">{dict.admin.phone}</label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+998 90 123 45 67"
          className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
        />
      </div>
      <div className="flex-1 min-w-[220px]">
        <label className="block text-xs font-medium text-brand-navy/70 mb-1">{dict.admin.course}</label>
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {dict.directions[c.direction as keyof typeof dict.directions]} ·{" "}
              {dict.subjects[c.subject as keyof typeof dict.subjects]}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={loading || !phone}
        className="rounded-full bg-brand-navy px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-navy-light transition-colors disabled:opacity-50"
      >
        {loading ? "..." : dict.admin.enrollButton}
      </button>
    </form>
  );
}
