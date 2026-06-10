import { getVibrationEnabled, saveVibrationEnabled } from "./storage";

export type VibrationKey =
  | "tap"
  | "score"
  | "hit"
  | "gameover"
  | "button"
  | "currentChange";

export const VIBRATION_PATTERNS: Record<VibrationKey, number | number[]> = {
  tap: 10,
  score: 20,
  hit: 80,
  gameover: [100, 50, 100],
  button: 8,
  currentChange: 15,
};

// Cached so the hot game loop doesn't hit localStorage every frame.
let enabled = getVibrationEnabled();

export function isVibrationEnabled(): boolean {
  return enabled;
}

export function setVibrationEnabled(value: boolean): void {
  enabled = value;
  saveVibrationEnabled(value);
}

function supportsVibration(): boolean {
  return typeof navigator !== "undefined" && "vibrate" in navigator;
}

/** Low-level: fire a raw pattern, respecting the enabled flag & feature test. */
export function vibrate(pattern: number | number[]): void {
  if (!enabled) return;
  if (!supportsVibration()) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* ignore — some browsers throw on disallowed patterns */
  }
}

/** Convenience: fire one of the named patterns. */
export function vibratePattern(key: VibrationKey): void {
  vibrate(VIBRATION_PATTERNS[key]);
}
