import type {
  Character,
  GameConfig,
  GameMode,
  GameModeMeta,
  Obstacle,
  OceanCurrent,
  Player,
} from "../types/game";

/** Dynamic, per-frame inputs shared with a mode strategy. */
export interface ModeEnv {
  ocean: OceanCurrent | null;
}

/**
 * A single control action. `pointerY` is the canvas-space Y of a tap/click
 * (used by Ocean to steer toward where you touched). `intent` is an explicit
 * up/down from the keyboard arrows.
 */
export interface ActionInput {
  pointerY?: number;
  intent?: "up" | "down";
}

/**
 * A mode strategy fully describes one game style: its difficulty curve,
 * physics, input response, and how it paints itself onto the canvas. The game
 * loop in GameCanvas stays generic and just delegates to the active strategy.
 */
export interface ModeStrategy {
  id: GameMode;
  meta: GameModeMeta;
  getSpeed(score: number): number;
  getGap(score: number): number;
  /** Advance one physics sub-step (stepRatio compensates for frame time). */
  updatePlayer(player: Player, stepRatio: number, env: ModeEnv): void;
  /** Respond to a tap/click/key (instant impulse). */
  handleInput(player: Player, input: ActionInput, env: ModeEnv): void;
  /** True for modes driven by press-and-hold steering rather than taps. */
  continuous?: boolean;
  /** Per-step steering while the input is held (continuous modes only). */
  steer?(player: Player, hold: ActionInput, stepRatio: number): void;
  drawBackground(
    ctx: CanvasRenderingContext2D,
    config: GameConfig,
    now: number,
    scroll: number,
    env: ModeEnv,
  ): void;
  drawObstacle(
    ctx: CanvasRenderingContext2D,
    obstacle: Obstacle,
    config: GameConfig,
  ): void;
  drawPlayer(
    ctx: CanvasRenderingContext2D,
    player: Player,
    character: Character,
  ): void;
  drawForeground(
    ctx: CanvasRenderingContext2D,
    config: GameConfig,
    scroll: number,
  ): void;
  /** Optional mode-specific HUD (e.g. ocean current indicator). */
  drawModeUI?(
    ctx: CanvasRenderingContext2D,
    config: GameConfig,
    env: ModeEnv,
  ): void;
}

export function clamp(value: number, lo: number, hi: number): number {
  return value < lo ? lo : value > hi ? hi : value;
}

/**
 * Draws the player emoji with a soft halo and a velocity-based tilt. Shared by
 * all three modes so the character looks consistent.
 */
export function drawEmojiPlayer(
  ctx: CanvasRenderingContext2D,
  player: Player,
  character: Character,
  tilt: number,
): void {
  ctx.save();
  ctx.translate(player.x, player.y);

  // Glow is circular, so draw it before any flip/rotate.
  const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, player.radius + 14);
  glow.addColorStop(0, `${character.color ?? "#ffd84d"}aa`);
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, player.radius + 14, 0, Math.PI * 2);
  ctx.fill();

  // Custom sprites are authored facing right already, so no flip/baseRotation.
  // Emojis: left-facing creatures are mirrored; up-pointing vehicles get a base
  // rotation. Mirroring reverses the visual sense of rotation, so the velocity
  // tilt is multiplied by the flip to keep nose-up/down natural.
  const sprite = character.sprite;
  const flip = sprite ? 1 : character.flipX ? -1 : 1;
  const base = sprite ? 0 : character.baseRotation ?? 0;
  ctx.scale(flip, 1);
  ctx.rotate(base + tilt * flip);

  if (sprite) {
    sprite(ctx, player.radius);
  } else {
    ctx.font = `${player.radius * 2.3}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(character.emoji, 0, 2);
  }

  ctx.restore();
}

/** Draws the player-mode score, centred near the top. */
export function drawScore(
  ctx: CanvasRenderingContext2D,
  config: GameConfig,
  score: number,
  color = "#ffffff",
): void {
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = '28px "Press Start 2P", system-ui, sans-serif';
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillText(String(score), config.width / 2 + 2, 70);
  ctx.fillStyle = color;
  ctx.fillText(String(score), config.width / 2, 68);
  ctx.restore();
}
