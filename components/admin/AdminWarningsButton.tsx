"use client";

import { useState } from "react";
import { getDictionary, formatTemplate, type Locale } from "@/lib/i18n/dictionaries";

export default function AdminWarningsButton({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleRun() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/warnings/run", { method: "POST" });
      const data = await res.json();
      setResult(formatTemplate(dict.admin.changesCount, { count: data.results?.length ?? 0 }));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleRun}
        disabled={loading}
        className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-brand-navy hover:border-brand-navy/30 hover:bg-black/[0.02] transition-colors disabled:opacity-50"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 3" />
        </svg>
        {loading ? dict.admin.checking : dict.admin.checkInactivity}
      </button>
      {result && <span className="text-xs text-brand-navy/50">{result}</span>}
    </div>
  );
}
