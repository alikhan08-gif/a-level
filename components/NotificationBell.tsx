"use client";

import { useEffect, useRef, useState } from "react";

type Notification = {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
};

const POLL_MS = 15000;
const TOAST_MS = 5000;

function timeAgo(iso: string, locale: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return locale === "uz" ? "hozirgina" : "just now";
  if (mins < 60) return locale === "uz" ? `${mins} daqiqa oldin` : `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return locale === "uz" ? `${hours} soat oldin` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return locale === "uz" ? `${days} kun oldin` : `${days}d ago`;
}

export default function NotificationBell({ locale }: { locale: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [toasts, setToasts] = useState<Notification[]>([]);
  const seenIds = useRef<Set<string> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) return;
        const data: { notifications: Notification[]; unreadCount: number } = await res.json();
        if (cancelled) return;

        if (seenIds.current === null) {
          // First load: don't toast anything that already existed.
          seenIds.current = new Set(data.notifications.map((n) => n.id));
        } else {
          const fresh = data.notifications.filter((n) => !seenIds.current!.has(n.id));
          fresh.forEach((n) => seenIds.current!.add(n.id));
          if (fresh.length > 0) {
            setToasts((prev) => [...fresh, ...prev]);
            fresh.forEach((n) => {
              setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== n.id));
              }, TOAST_MS);
            });
          }
        }

        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } catch {
        // Silently ignore transient network errors; next poll will retry.
      }
    }

    poll();
    const interval = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0) {
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      fetch("/api/notifications/mark-read", { method: "POST" }).catch(() => {});
    }
  }

  return (
    <>
      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={toggleOpen}
          aria-label="Bildirishnomalar"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border-2 border-sky-400/60 text-brand-navy hover:bg-sky-50/50 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 8a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6.5H4c.5-1 2-2.5 2-6.5Z" />
            <path d="M9.5 17a2.5 2.5 0 0 0 5 0" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-gold px-1 text-[10px] font-bold text-brand-navy">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-12 z-50 w-80 max-w-[90vw] rounded-2xl border border-black/10 bg-white shadow-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-black/10 font-bold text-brand-navy text-sm">
              {locale === "uz" ? "Bildirishnomalar" : "Notifications"}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-brand-navy/50">
                  {locale === "uz" ? "Bildirishnomalar yo'q" : "No notifications"}
                </p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-black/[0.04] last:border-0 ${!n.read ? "bg-sky-50/50" : ""}`}
                  >
                    <p className="text-sm text-brand-navy leading-snug">{n.message}</p>
                    <p className="text-xs text-brand-navy/40 mt-1">{timeAgo(n.createdAt, locale)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className="fixed top-24 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[90vw]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="rounded-xl border border-black/10 bg-white shadow-lg px-4 py-3 animate-in fade-in slide-in-from-top-2"
          >
            <p className="text-sm text-brand-navy leading-snug">{t.message}</p>
          </div>
        ))}
      </div>
    </>
  );
}
