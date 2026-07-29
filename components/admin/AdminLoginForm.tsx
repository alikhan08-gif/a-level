"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";

export default function AdminLoginForm({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? dict.bookOrder.genericError);
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.bookOrder.genericError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-navy px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-6 space-y-4">
        <h1 className="text-lg font-bold text-brand-navy text-center">{dict.admin.panelTitle}</h1>
        {error && <div className="rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={dict.admin.password}
          className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-brand-navy px-6 py-3 text-white font-semibold hover:bg-brand-navy-light transition-colors disabled:opacity-50"
        >
          {loading ? "..." : dict.admin.login}
        </button>
      </form>
    </div>
  );
}
