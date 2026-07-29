"use client";

import { useEffect, useRef, useState } from "react";
import { loadFaceModels, detectFaceDescriptor, isFrameBlank } from "@/lib/face";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";

export default function FaceCapture({
  title,
  buttonLabel,
  onCaptured,
  locale,
}: {
  title: string;
  buttonLabel: string;
  onCaptured: (descriptor: number[]) => void | Promise<void>;
  locale: Locale;
}) {
  const dict = getDictionary(locale);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "capturing" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        await loadFaceModels();
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStatus("ready");
      } catch {
        setError(dict.auth.cameraError);
        setStatus("error");
      }
    }
    init();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleCapture() {
    // Hard safety net: whatever happens inside runCapture, the button must
    // never stay stuck on the "checking" label for more than a few seconds.
    // Calling setState after unmount is a silent no-op in React 18+, so no
    // "is this still mounted" guard is needed here.
    const watchdog = setTimeout(() => setStatus("ready"), 15000);
    runCapture().finally(() => clearTimeout(watchdog));
  }

  async function runCapture() {
    if (!videoRef.current) return;
    setStatus("capturing");
    setError(null);
    try {
      if (isFrameBlank(videoRef.current)) {
        setError(dict.auth.blankFrameError);
        return;
      }
      const descriptor = await detectFaceDescriptor(videoRef.current);
      if (!descriptor) {
        setError(dict.auth.noFaceError);
        return;
      }
      // Let the caller do the actual login/verify request, then always
      // fall back to "ready" here so a mismatch lets the user retry
      // immediately instead of the button staying stuck on "checking".
      await onCaptured(descriptor);
    } catch (err) {
      console.error("FaceCapture error:", err);
      setError(
        err instanceof Error && err.message === "Yuz aniqlash vaqti tugadi"
          ? dict.auth.timeoutError
          : dict.auth.genericFaceError
      );
    } finally {
      setStatus("ready");
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 text-center shadow-2xl shadow-black/40">
      <h2 className="font-bold text-white mb-1">{title}</h2>
      <p className="text-sm text-white/50 mb-4">{dict.auth.faceHint}</p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-400/20 bg-red-500/10 text-red-300 text-sm px-3 py-2">
          {error}
        </div>
      )}

      <div className="relative mx-auto mb-4 aspect-square w-56 overflow-hidden rounded-full bg-white/5 border-2 border-[#5aa8e0]/30">
        <video ref={videoRef} muted playsInline className="h-full w-full object-cover [transform:scaleX(-1)]" />
        {status === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs text-white/70">
            {dict.auth.loadingCamera}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleCapture}
        disabled={status === "loading" || status === "capturing" || status === "error"}
        className="rounded-full bg-gradient-to-r from-[#3f7fc9] to-[#5aa8e0] px-6 py-3 text-white font-semibold hover:brightness-110 transition-all disabled:opacity-50"
      >
        {status === "capturing" ? dict.auth.checking : buttonLabel}
      </button>
    </div>
  );
}
