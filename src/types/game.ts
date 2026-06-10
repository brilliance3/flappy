export interface Character {
  id: string;
  name: string;
  emoji: string;
  /** Optional tint applied to the character's halo / glow. */
  color?: string;
  /** Modes this character is thematically suited to (used for hints only). */
  recommendedModes?: GameMode[];
  /**
   * Mirror the emoji horizontally so its "front" points right — the direction
   * the runner travels. Used for side-facing creatures that default to facing
   * left (chick, bee, fish…).
   */
  flipX?: boolean;
  /**
   * Base rotation (radians, clockwise) applied so an emoji that naturally
   * points up / up-right (rocket…) ends up pointing right. Combined with the
   * velocity tilt at draw time.
   */
  baseRotation?: number;
  /**
   * Optional custom canvas sprite, authored facing right and centred on the
   * origin. When present it is drawn instead of the emoji (no flip/baseRotation
   * applied — the sprite already faces the travel direction). `r` is the
   * player radius. Used for characters that no emoji renders well (full-body
   * side-view bird, side-view bat, side-view paper plane).
   */
  sprite?: (ctx: CanvasRenderingContext2D, r: number) => void;
}

export interface Player {
  x: number;
  y: number;
  radius: number;
  velocity: number;
}

export interface Obstacle {
  x: number;
  topHeight: number;
  bottomY: number;
  passed: boolean;
  /** Visual variant so each column can look slightly different. */
  variant: number;
}

/** The three playable game styles. */
export type GameMode = "sky" | "space" | "ocean";

export type GameStatus = "ready" | "playing" | "paused" | "gameover";

/** Ocean-mode current direction. */
export type CurrentDirection = "up" | "down" | "neutral";

/** Live ocean-current state, advanced every frame in Ocean mode. */
export interface OceanCurrent {
  direction: CurrentDirection;
  /** Per-step force magnitude (always >= 0). */
  strength: number;
  /** Milliseconds remaining before the next direction takes over. */
  remainingTime: number;
  /** The direction the current is about to switch to (used for the warning). */
  nextDirection: CurrentDirection;
  /** True during the ~1s lead-up to a change so the UI can warn the player. */
  warning: boolean;
}

/** Ocean control schemes — A (single tap) for MVP, B (split) as an option. */
export type OceanControlType = "single" | "split";

export interface GameModeMeta {
  id: GameMode;
  title: string;
  subtitle: string;
  description: string;
  difficulty: "easy" | "normal" | "hard";
  difficultyLabel: string;
  backgroundTheme: GameMode;
  controlHint: string;
  /** Emoji used on the mode-selection card. */
  badge: string;
}

export const GAME_MODES: GameModeMeta[] = [
  {
    id: "sky",
    title: "하늘 날기",
    subtitle: "터치하면 위로 날아올라요",
    description: "떨어지는 캐릭터를 터치로 날려 구름 기둥 사이를 통과하세요.",
    difficulty: "easy",
    difficultyLabel: "쉬움",
    backgroundTheme: "sky",
    controlHint: "터치하면 위로 날아올라요",
    badge: "☁️",
  },
  {
    id: "space",
    title: "우주 하강",
    subtitle: "터치하면 아래로 내려가요",
    description: "계속 떠오르는 우주선을 터치로 내려 운석 사이를 통과하세요.",
    difficulty: "normal",
    difficultyLabel: "보통",
    backgroundTheme: "space",
    controlHint: "터치하면 아래로 내려가요",
    badge: "🪐",
  },
  {
    id: "ocean",
    title: "바다 해류 모험",
    subtitle: "터치한 방향으로 헤엄쳐요",
    description: "바뀌는 해류를 거슬러 캐릭터를 조절해 산호와 바위 사이를 통과하세요.",
    difficulty: "hard",
    difficultyLabel: "어려움",
    backgroundTheme: "ocean",
    controlHint: "터치(또는 ↑/↓ 키)한 방향으로 헤엄쳐요",
    badge: "🌊",
  },
];

export function getModeMeta(mode: GameMode): GameModeMeta {
  return GAME_MODES.find((m) => m.id === mode) ?? GAME_MODES[0];
}

export interface GameConfig {
  width: number;
  height: number;
  /** Geometry only — physics constants live in each mode strategy. */
  pipeWidth: number;
  pipeSpawnDistance: number;
  groundHeight: number;
  playerRadius: number;
}

export const GAME_CONFIG: GameConfig = {
  width: 390,
  height: 640,
  pipeWidth: 70,
  pipeSpawnDistance: 230,
  groundHeight: 80,
  playerRadius: 18,
};

/** Back-compat alias for the original constant name. */
export const DEFAULT_CONFIG = GAME_CONFIG;

/** Shared physics tuning, referenced by the individual mode strategies. */
export const PHYSICS = {
  gravity: 0.45,
  reverseGravity: -0.45,
  jumpForce: -7.5,
  diveForce: 7.5,
  maxFallSpeed: 11,
  maxRiseSpeed: -11,
  /** Gentle downward drift when the current is neutral (so tap-to-rise works). */
  oceanNeutralGravity: 0.14,
  oceanUpForce: -6.0,
  oceanDownForce: 6.0,
  oceanSpeedClamp: 8.5,
} as const;

export interface MedalRule {
  bronze: number;
  silver: number;
  gold: number;
}

export const MEDAL_RULES: Record<GameMode, MedalRule> = {
  sky: { bronze: 10, silver: 25, gold: 50 },
  space: { bronze: 8, silver: 20, gold: 45 },
  ocean: { bronze: 6, silver: 15, gold: 35 },
};

export type MedalTier = "gold" | "silver" | "bronze" | null;

export function medalFor(mode: GameMode, score: number): MedalTier {
  const rule = MEDAL_RULES[mode];
  if (score >= rule.gold) return "gold";
  if (score >= rule.silver) return "silver";
  if (score >= rule.bronze) return "bronze";
  return null;
}
