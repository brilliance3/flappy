const BEST_SCORE_KEY = "twr.bestScore";
const SELECTED_CHARACTER_KEY = "twr.selectedCharacter";

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

export function getBestScore(): number {
  const raw = safeGet(BEST_SCORE_KEY);
  if (!raw) return 0;
  const value = parseInt(raw, 10);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function saveBestScore(score: number): number {
  const current = getBestScore();
  if (score > current) {
    safeSet(BEST_SCORE_KEY, String(score));
    return score;
  }
  return current;
}

export function getSelectedCharacterId(fallback: string): string {
  return safeGet(SELECTED_CHARACTER_KEY) ?? fallback;
}

export function saveSelectedCharacterId(id: string): void {
  safeSet(SELECTED_CHARACTER_KEY, id);
}
