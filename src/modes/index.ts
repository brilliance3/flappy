import type { GameMode } from "../types/game";
import { oceanMode } from "./oceanMode";
import { skyMode } from "./skyMode";
import { spaceMode } from "./spaceMode";
import type { ModeStrategy } from "./shared";

export const MODES: Record<GameMode, ModeStrategy> = {
  sky: skyMode,
  space: spaceMode,
  ocean: oceanMode,
};

export function getMode(mode: GameMode): ModeStrategy {
  return MODES[mode];
}

export type { ModeStrategy, ModeEnv } from "./shared";
export { createOceanCurrent, updateOceanCurrent } from "./oceanMode";
