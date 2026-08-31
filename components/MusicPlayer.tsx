"use client";

import { useEffect, useRef, useState } from "react";
import { MUSIC_TRACKS, type MusicTrack } from "@/lib/musicTracks";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { loadYoutubeApi, type YTPlayer } from "@/lib/youtubeApi";

// A result from the live YouTube search — shares the same playable shape as
// a curated MusicTrack but is clearly NOT hand-vetted, so the UI keeps it in
// its own labeled section instead of blending it into the trusted list.
type YoutubeResult = { id: string; title: string; channel: string };

// Above this, treat playback as a livestream (hide the seek bar) even if it
// wasn't marked `live` up front — covers open-search results, which we have
// no static metadata for.
const LIVE_LIKE_DURATION_SEC = 4 * 60 * 60;

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
  const [current, setCurrent] = useState<MusicTrack | YoutubeResult | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ready, setReady] = useState(false);

  const [ytResults, setYtResults] = useState<YoutubeResult[]>([]);
  const [ytLoading, setYtLoading] = useState(false);

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
    if (!ready || !current) return;
    const interval = setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      setProgress(player.getCurrentTime() || 0);
      setDuration(player.getDuration() || 0);
    }, 500);
    return () => clearInterval(interval);
  }, [ready, current]);

  // Debounced live YouTube search alongside the curated list.
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setYtResults([]);
      setYtLoading(false);
      return;
    }
    setYtLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/music/search?q=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        setYtResults(data.results ?? []);
      } catch {
        setYtResults([]);
      } finally {
        setYtLoading(false);
      }
    }, 450);
    return () => clearTimeout(timeout);
  }, [query]);

  function playTrack(track: MusicTrack | YoutubeResult) {
    const player = playerRef.current;
    if (!player || !ready) return;
    setCurrent(track);
    player.loadVideoById(track.id);
    player.playVideo();
  }

  function togglePlayback() {
    const player = playerRef.current;
    if (!player || !current) return;
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
  const isLiveLike = ("live" in (current ?? {}) && (current as MusicTrack).live) || duration > LIVE_LIKE_DURATION_SEC;

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

            <div className="max-h-72 overflow-y-auto px-2 pb-2">
              {filtered.length === 0 ? (
                <p className="px-3 py-4 text-sm text-brand-navy/50 text-center">{dict.music.noResults}</p>
              ) : (
                filtered.map((track) => {
                  const isCurrent = current?.id === track.id;
                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => playTrack(track)}
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

              {query.trim().length >= 2 && (
                <div className="mt-2 border-t border-black/[0.06] pt-2">
                  <p className="px-2.5 pb-1 text-[10px] font-semibold text-brand-navy/40 uppercase tracking-wide">
                    {dict.music.youtubeResults}
                  </p>
                  {ytLoading ? (
                    <p className="px-3 py-3 text-xs text-brand-navy/50 text-center">{dict.music.youtubeSearching}</p>
                  ) : ytResults.length === 0 ? (
                    <p className="px-3 py-3 text-xs text-brand-navy/50 text-center">{dict.music.noResults}</p>
                  ) : (
                    <>
                      <p className="px-2.5 pb-1.5 text-[10px] text-amber-600">{dict.music.youtubeUnverified}</p>
                      {ytResults.map((track) => {
                        const isCurrent = current?.id === track.id;
                        return (
                          <button
                            key={track.id}
                            type="button"
                            onClick={() => playTrack(track)}
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
                              <p className="text-[10px] text-brand-navy/50 truncate">{track.channel}</p>
                            </span>
                          </button>
                        );
                      })}
                    </>
                  )}
                </div>
              )}
            </div>

            {current && (
              <div className="border-t border-black/10 px-4 py-3 space-y-2">
                <p className="text-[10px] font-semibold text-brand-navy/40 uppercase tracking-wide">
                  {dict.music.nowPlaying}
                </p>
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-brand-navy truncate">{current.title}</p>
                  {isLiveLike && (
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
                  {isLiveLike ? (
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
