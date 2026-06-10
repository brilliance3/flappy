import type { GameMode } from "../types/game";

const SELECTED_CHARACTER_KEY = "twr.selectedCharacter";
const SELECTED_MODE_KEY = "twr.selectedMode";
const SOUND_ENABLED_KEY = "twr.soundEnabled";
const BGM_ENABLED_KEY = "twr.bgmEnabled";
const VIBRATION_ENABLED_KEY = "twr.vibrationEnabled";

/** Legacy single-mode best-score key (migrated into the Sky mode key). */
const LEGACY_BEST_SCORE_KEY = "twr.bestScore";

/** Safe wrapper that ignores any storage errors (private mode, etc.). */
function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

function bestScoreKey(mode: GameMode): string {
  return `twr.bestScore.${mode}`;
}

/* ---------- Best scores (per mode) ---------- */

export function getBestScore(mode: GameMode): number {
  let raw = safeGet(bestScoreKey(mode));
  // One-time migration from the original single key into Sky mode.
  if (raw === null && mode === "sky") {
    raw = safeGet(LEGACY_BEST_SCORE_KEY);
  }
  if (!raw) return 0;
  const value = parseInt(raw, 10);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

/** Persists the score if it beats the stored best. Returns the new best. */
export function saveBestScore(mode: GameMode, score: number): number {
  const current = getBestScore(mode);
  if (score > current) {
    safeSet(bestScoreKey(mode), String(score));
    return score;
  }
  return current;
}

/* ---------- Selected character / mode ---------- */

export function getSelectedCharacterId(fallback: string): string {
  return safeGet(SELECTED_CHARACTER_KEY) ?? fallback;
}

export function saveSelectedCharacterId(id: string): void {
  safeSet(SELECTED_CHARACTER_KEY, id);
}

export function getSelectedMode(fallback: GameMode): GameMode {
  const raw = safeGet(SELECTED_MODE_KEY);
  if (raw === "sky" || raw === "space" || raw === "ocean") return raw;
  return fallback;
}

export function saveSelectedMode(mode: GameMode): void {
  safeSet(SELECTED_MODE_KEY, mode);
}

/* ---------- Sound / vibration settings ---------- */

function getFlag(key: string, fallback: boolean): boolean {
  const raw = safeGet(key);
  if (raw === null) return fallback;
  return raw === "1" || raw === "true";
}

function setFlag(key: string, value: boolean): void {
  safeSet(key, value ? "1" : "0");
}

export function getSoundEnabled(): boolean {
  return getFlag(SOUND_ENABLED_KEY, true);
}
export function saveSoundEnabled(enabled: boolean): void {
  setFlag(SOUND_ENABLED_KEY, enabled);
}

export function getBgmEnabled(): boolean {
  return getFlag(BGM_ENABLED_KEY, true);
}
export function saveBgmEnabled(enabled: boolean): void {
  setFlag(BGM_ENABLED_KEY, enabled);
}

export function getVibrationEnabled(): boolean {
  return getFlag(VIBRATION_ENABLED_KEY, true);
}
export function saveVibrationEnabled(enabled: boolean): void {
  setFlag(VIBRATION_ENABLED_KEY, enabled);
}
