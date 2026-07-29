"use client";

import { useRouter } from "next/navigation";

export default function CabinetLogoutCart({ logoutLabel }: { logoutLabel: string }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="w-full h-10 rounded-full border-2 border-sky-400/60 text-xs font-semibold text-brand-navy hover:bg-sky-50/50 transition-colors"
    >
      {logoutLabel}
    </button>
  );
}
