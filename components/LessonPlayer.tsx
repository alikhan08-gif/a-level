"use client";

import { useEffect, useRef, useState } from "react";
import { progressForViewCount, LESSON_COMPLETE_VIEW_COUNT } from "@/lib/progress";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement,
        opts: {
          videoId: string;
          playerVars?: Record<string, unknown>;
          events?: {
            onReady?: (e: { target: YTPlayer }) => void;
            onStateChange?: (e: { data: number; target: YTPlayer }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: { ENDED: number; PLAYING: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayer {
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  playVideo: () => void;
}

let apiLoadPromise: Promise<void> | null = null;
function loadYoutubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (apiLoadPromise) return apiLoadPromise;
  apiLoadPromise = new Promise((resolve) => {
    window.onYouTubeIframeAPIReady = () => resolve();
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  });
  return apiLoadPromise;
}

export default function LessonPlayer({
  lessonId,
  videoId,
  initialViewCount,
  initialPositionSec,
  locale,
}: {
  lessonId: string;
  videoId: string;
  initialViewCount: number;
  initialPositionSec: number;
  locale: Locale;
}) {
  const dict = getDictionary(locale);
  const [viewCount, setViewCount] = useState(initialViewCount);
  const [positionSec, setPositionSec] = useState(initialPositionSec);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const saveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { percent, color } = progressForViewCount(viewCount);
  const complete = viewCount >= LESSON_COMPLETE_VIEW_COUNT;
  const buttonLabel =
    viewCount === 0 ? dict.kabinet.watch : positionSec > 0 ? dict.kabinet.resume : dict.kabinet.watchAgain;

  useEffect(() => {
    return () => {
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
    };
  }, []);

  async function savePosition(sec: number) {
    setPositionSec(sec);
    await fetch(`/api/lessons/${lessonId}/position`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ positionSec: sec }),
    });
  }

  async function handleStart() {
    setLoading(true);
    const isResume = positionSec > 0;
    try {
      if (!isResume) {
        const res = await fetch(`/api/lessons/${lessonId}/view`, { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          setViewCount(data.progress.viewCount);
        }
      }
      await loadYoutubeApi();
      setPlaying(true);
      requestAnimationFrame(() => {
        if (!containerRef.current) return;
        playerRef.current = new window.YT!.Player(containerRef.current, {
          videoId,
          playerVars: { start: Math.floor(positionSec), autoplay: 1 },
          events: {
            onReady: (e) => e.target.playVideo(),
            onStateChange: (e) => {
              if (e.data === window.YT!.PlayerState.PLAYING) {
                if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
                saveIntervalRef.current = setInterval(() => {
                  savePosition(Math.floor(e.target.getCurrentTime()));
                }, 5000);
              }
              if (e.data === window.YT!.PlayerState.ENDED) {
                if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
                savePosition(0);
              }
            },
          },
        });
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`text-xs font-semibold rounded-full px-2.5 py-1 ${
            color === "red" ? "bg-red-100 text-red-700" : color === "yellow" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
          }`}
        >
          {percent}%
        </span>
        {complete && <span className="text-xs text-brand-navy/50">{dict.kabinet.videoWatchedFully}</span>}
      </div>

      {playing ? (
        <div ref={containerRef} className="aspect-video w-full rounded-xl overflow-hidden bg-black" />
      ) : (
        <button
          type="button"
          onClick={handleStart}
          disabled={loading}
          className="aspect-video w-full rounded-xl bg-brand-navy/5 border border-black/10 flex flex-col items-center justify-center gap-3 hover:bg-brand-navy/10 transition-colors disabled:opacity-50"
        >
          <span className="h-14 w-14 rounded-full bg-brand-navy flex items-center justify-center text-white">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7Z" />
            </svg>
          </span>
          <span className="font-semibold text-brand-navy">{loading ? dict.kabinet.loading : buttonLabel}</span>
        </button>
      )}
    </div>
  );
}
