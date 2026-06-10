import type { GameMode } from "../types/game";

/** Short one-shot sound effects. */
export type SoundKey = "tap" | "score" | "hit" | "gameover" | "button";

/** Background-music tracks — one per game mode. */
export type BgmKey = GameMode;

/** Recommended mix levels (0..1). */
export const BGM_VOLUME = 0.35;
export const SFX_VOLUME = 0.7;
