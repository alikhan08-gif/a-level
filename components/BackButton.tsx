"use client";

import { useRouter } from "next/navigation";

export default function BackButton({ label }: { label: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 rounded-full border-2 border-brand-navy px-6 py-2.5 text-sm font-bold text-brand-navy hover:bg-brand-navy hover:text-white transition-colors"
    >
      &larr; {label}
    </button>
  );
}
