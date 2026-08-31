"use client";

import { useEffect, useRef, useState } from "react";
import { MUSIC_TRACKS } from "@/lib/musicTracks";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { loadYoutubeApi, type YTPlayer } from "@/lib/youtubeApi";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function MusicPlayer({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ready, setReady] = useState(false);

  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);

  // Load the YouTube IFrame API once and create a hidden (audio-only) player.
  useEffect(() => {
    let cancelled = false;
    loadYoutubeApi().then(() => {
      if (cancelled || !hostRef.current || playerRef.current || !window.YT) return;
      playerRef.current = new window.YT.Player(hostRef.current, {
        playerVars: { controls: 0, disablekb: 1, playsinline: 1 },
        events: {
          onReady: () => setReady(true),
          onStateChange: (e) => {
            setPlaying(e.data === window.YT!.PlayerState.PLAYING);
          },
        },
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Poll playback progress while a track is loaded.
  useEffect(() => {
    if (!ready || currentIndex === null) return;
    const interval = setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      setProgress(player.getCurrentTime() || 0);
      setDuration(player.getDuration() || 0);
    }, 500);
    return () => clearInterval(interval);
  }, [ready, currentIndex]);

  function playTrack(index: number) {
    const player = playerRef.current;
    if (!player || !ready) return;
    setCurrentIndex(index);
    player.loadVideoById(MUSIC_TRACKS[index].id);
    player.playVideo();
  }

  function togglePlayback() {
    const player = playerRef.current;
    if (!player || currentIndex === null) return;
    if (playing) player.pauseVideo();
    else player.playVideo();
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const player = playerRef.current;
    if (!player) return;
    const value = Number(e.target.value);
    player.seekTo(value, true);
    setProgress(value);
  }

  const filtered = MUSIC_TRACKS.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()));
  const current = currentIndex !== null ? MUSIC_TRACKS[currentIndex] : null;

  return (
    <>
      {/* Hidden player — kept tiny and off-screen so only audio plays. */}
      <div className="fixed -top-[9999px] -left-[9999px] h-px w-px overflow-hidden opacity-0" aria-hidden="true">
        <div ref={hostRef} />
      </div>

      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
        {open && (
          <div className="w-[320px] max-w-[90vw] rounded-2xl border border-black/10 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-black/10">
              <h3 className="font-bold text-brand-navy text-sm">{dict.music.panelTitle}</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Yopish"
                className="text-brand-navy/50 hover:text-brand-navy"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="px-4 pt-3 pb-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={dict.music.searchPlaceholder}
                className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/30"
              />
            </div>

            <div className="max-h-64 overflow-y-auto px-2 pb-2">
              {filtered.length === 0 ? (
                <p className="px-3 py-4 text-sm text-brand-navy/50 text-center">{dict.music.noResults}</p>
              ) : (
                filtered.map((track) => {
                  const index = MUSIC_TRACKS.indexOf(track);
                  const isCurrent = index === currentIndex;
                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => playTrack(index)}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                        isCurrent ? "bg-brand-navy/10" : "hover:bg-black/[0.04]"
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                          isCurrent && playing ? "bg-brand-navy text-white" : "bg-black/5 text-brand-navy/60"
                        }`}
                      >
                        {isCurrent && playing ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="5" width="4" height="14" />
                            <rect x="14" y="5" width="4" height="14" />
                          </svg>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-brand-navy truncate">{track.title}</p>
                        <p className="text-[10px] text-brand-navy/50">{track.category}</p>
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {current && (
              <div className="border-t border-black/10 px-4 py-3 space-y-2">
                <p className="text-[10px] font-semibold text-brand-navy/40 uppercase tracking-wide">
                  {dict.music.nowPlaying}
                </p>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-brand-navy truncate">{current.title}</p>
                  {current.live && (
                    <span className="shrink-0 flex items-center gap-1 rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
                      LIVE
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlayback}
                    aria-label={playing ? dict.music.pause : dict.music.play}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-navy text-white hover:bg-brand-navy-light transition-colors"
                  >
                    {playing ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="5" width="4" height="14" />
                        <rect x="14" y="5" width="4" height="14" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>
                  {current.live ? (
                    <span className="flex-1 text-[11px] text-brand-navy/50">24/7 radio</span>
                  ) : (
                    <>
                      <span className="text-[10px] text-brand-navy/50 w-8 text-right">{formatTime(progress)}</span>
                      <input
                        type="range"
                        min={0}
                        max={duration || 0}
                        value={progress}
                        onChange={handleSeek}
                        className="flex-1 accent-[color:var(--brand-navy)]"
                      />
                      <span className="text-[10px] text-brand-navy/50 w-8">{formatTime(duration)}</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={dict.music.buttonLabel}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-navy text-white shadow-xl hover:bg-brand-navy-light transition-colors relative"
        >
          {playing && (
            <span className="absolute inset-0 rounded-full bg-brand-navy animate-ping opacity-40" aria-hidden="true" />
          )}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="relative">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </button>
      </div>
    </>
  );
}
