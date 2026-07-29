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
      {result && <span className="text-xs text-brand-navy/50">{result}</span>}
      <button
        type="button"
        onClick={handleRun}
        disabled={loading}
        className="text-sm font-semibold text-brand-navy hover:underline disabled:opacity-50"
      >
        {loading ? dict.admin.checking : dict.admin.checkInactivity}
      </button>
    </div>
  );
}
