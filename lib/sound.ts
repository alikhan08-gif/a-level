// Tiny synthesized UI sound effects via the Web Audio API — no audio
// files needed, so nothing to download or bundle.
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtor) return null;
  if (!audioCtx) audioCtx = new AudioCtor();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function tone(freqStart: number, freqEnd: number, duration: number, gainValue: number, type: OscillatorType) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freqStart, ctx.currentTime);
  if (freqEnd !== freqStart) {
    osc.frequency.exponentialRampToValueAtTime(freqEnd, ctx.currentTime + duration);
  }
  gain.gain.setValueAtTime(gainValue, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration + 0.02);
}

// A short "ting" keystroke click.
export function playTypingTick() {
  tone(1000 + Math.random() * 300, 1000 + Math.random() * 300, 0.04, 0.04, "square");
}

// A quick rising/falling "shing" whoosh for the mascot's eyes covering/uncovering.
export function playWhoosh(rising: boolean) {
  tone(rising ? 320 : 900, rising ? 900 : 320, 0.16, 0.07, "sine");
}
