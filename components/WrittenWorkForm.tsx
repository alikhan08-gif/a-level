"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";

export default function WrittenWorkForm({
  courses,
  locale,
}: {
  courses: { id: string; title: string }[];
  locale: Locale;
}) {
  const dict = getDictionary(locale);
  const router = useRouter();
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [prompt, setPrompt] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastScore, setLastScore] = useState<number | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!courseId || !prompt.trim() || !content.trim()) {
      setError(dict.rating.writtenWorkFillAll);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/written-work", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, prompt, content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? dict.bookOrder.genericError);
      setLastScore(data.work.score);
      setPrompt("");
      setContent("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.bookOrder.genericError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[28px] border border-black/10 bg-white p-6 space-y-4">
      {error && <div className="rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}
      {lastScore !== null && (
        <div className="rounded-lg bg-green-50 text-green-700 text-sm px-3 py-2 font-semibold">
          {dict.rating.writtenWorkScore}: {lastScore}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-brand-navy/80 mb-1">{dict.rating.writtenWorkCourse}</label>
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-navy/80 mb-1">{dict.rating.writtenWorkPrompt}</label>
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={dict.rating.writtenWorkPromptPlaceholder}
          className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-brand-navy/80 mb-1">{dict.rating.writtenWorkContent}</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-brand-navy px-6 py-3 text-white font-semibold hover:bg-brand-navy-light transition-colors disabled:opacity-50"
      >
        {loading ? dict.rating.writtenWorkSubmitting : dict.rating.writtenWorkSubmit}
      </button>
    </form>
  );
}
