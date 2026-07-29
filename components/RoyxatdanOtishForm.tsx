"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import FaceCapture from "@/components/FaceCapture";
import PasswordGuardMascot from "@/components/PasswordGuardMascot";
import SignInDoorIcon from "@/components/SignInDoorIcon";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { playTypingTick, playWhoosh } from "@/lib/sound";
import { sanitizePhoneInput } from "@/lib/phone";

export default function RoyxatdanOtishForm({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const router = useRouter();
  const [step, setStep] = useState<"form" | "face">("form");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handlePasswordFocus() {
    setPasswordFocused(true);
    playWhoosh(true);
  }

  function handlePasswordBlur() {
    setPasswordFocused(false);
    playWhoosh(false);
  }

  function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !password) {
      setError(dict.bookOrder.fillAllFields);
      return;
    }
    if (password.length < 6) {
      setError(dict.auth.passwordTooShort);
      return;
    }
    setStep("face");
  }

  async function handleFaceCaptured(descriptor: number[]) {
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone, password, faceDescriptor: descriptor }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? dict.bookOrder.genericError);
      router.push("/kabinet");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.bookOrder.genericError);
      setStep("form");
    }
  }

  return (
    <div className="min-h-[80vh] bg-gradient-to-b from-[#0a1628] to-[#050b14] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {step === "form" && (
          <form
            onSubmit={handleContinue}
            className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 shadow-2xl shadow-black/40"
          >
            <PasswordGuardMascot covering={passwordFocused} />
            <h1 className="text-xl font-bold text-white text-center">{dict.auth.registerTitle}</h1>
            {error && (
              <div className="rounded-lg border border-red-400/20 bg-red-500/10 text-red-300 text-sm px-3 py-2">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">{dict.auth.firstName}</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#5aa8e0] focus:ring-2 focus:ring-[#5aa8e0]/30 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">{dict.auth.lastName}</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#5aa8e0] focus:ring-2 focus:ring-[#5aa8e0]/30 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">{dict.auth.phone}</label>
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(sanitizePhoneInput(e.target.value))}
                onKeyDown={playTypingTick}
                placeholder="+998 90 123 45 67"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#5aa8e0] focus:ring-2 focus:ring-[#5aa8e0]/30 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">{dict.auth.password}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={playTypingTick}
                  onFocus={handlePasswordFocus}
                  onBlur={handlePasswordBlur}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 pr-10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#5aa8e0] focus:ring-2 focus:ring-[#5aa8e0]/30 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-white/30 hover:text-white/70"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.4 5.4A9.6 9.6 0 0 1 12 5c5 0 9 4 10 7-.5 1.4-1.5 3-3 4.3M6.7 6.7C4.7 8 3.3 9.9 2 12c1 3 5 7 10 7 1.4 0 2.7-.3 3.9-.8" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#3f7fc9] to-[#5aa8e0] px-6 py-3 text-white font-semibold hover:brightness-110 transition-all"
            >
              {dict.auth.continue}
              <SignInDoorIcon active={passwordFocused} />
            </button>
            <p className="text-center text-sm text-white/50">
              {dict.auth.haveAccount}{" "}
              <Link href="/kirish" className="font-semibold text-[#8fc4ec] hover:text-white transition-colors">
                {dict.auth.goLogin}
              </Link>
            </p>
          </form>
        )}

        {step === "face" && (
          <div className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-400/20 bg-red-500/10 text-red-300 text-sm px-3 py-2">
                {error}
              </div>
            )}
            <FaceCapture
              title={dict.auth.faceRegisterTitle}
              buttonLabel={dict.auth.captureButton}
              onCaptured={handleFaceCaptured}
              locale={locale}
            />
            <button
              type="button"
              onClick={() => setStep("form")}
              className="w-full text-sm font-semibold text-white/50 hover:text-white/80 transition-colors"
            >
              &larr; {dict.auth.back}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
