import {
  PHYSICS,
  getModeMeta,
  type Character,
  type GameConfig,
  type Obstacle,
  type Player,
} from "../types/game";
import { clamp, drawEmojiPlayer, type ModeStrategy } from "./shared";

/* ---------- Difficulty (slightly easier start than Sky) ---------- */

function getSpeed(score: number): number {
  return Math.min(2.3 + score * 0.03, 4.3);
}

function getGap(score: number): number {
  return Math.max(190 - score * 1.2, 145);
}

/* ---------- Drawing ---------- */

/** Cheap deterministic hash so stars keep stable positions across frames. */
function hash(i: number): number {
  const x = Math.sin(i * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

function drawAsteroidPillar(
  ctx: CanvasRenderingContext2D,
  x: number,
  startY: number,
  height: number,
  width: number,
  variant: number,
  side: "top" | "bottom",
): void {
  if (height <= 0) return;
  const base = variant === 0 ? "#5b5168" : variant === 1 ? "#4a4a5e" : "#615466";

  const grad = ctx.createLinearGradient(x, 0, x + width, 0);
  grad.addColorStop(0, "#2c2738");
  grad.addColorStop(0.5, base);
  grad.addColorStop(1, "#241f30");
  ctx.fillStyle = grad;
  ctx.fillRect(x, startY, width, height);

  // Craters.
  ctx.fillStyle = "rgba(20,16,30,0.55)";
  for (let i = 0; i < 4; i++) {
    const cx = x + 12 + hash(x + i) * (width - 24);
    const cy = startY + 16 + hash(x + i * 3) * Math.max(8, height - 32);
    ctx.beginPath();
    ctx.arc(cx, cy, 4 + hash(i) * 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Glowing energy-gate rim on the open end.
  const rimY = side === "top" ? startY + height : startY;
  const rimGrad = ctx.createLinearGradient(x, rimY - 6, x, rimY + 6);
  rimGrad.addColorStop(0, "rgba(120,200,255,0)");
  rimGrad.addColorStop(0.5, "rgba(120,220,255,0.9)");
  rimGrad.addColorStop(1, "rgba(120,200,255,0)");
  ctx.fillStyle = rimGrad;
  ctx.fillRect(x - 2, rimY - 6, width + 4, 12);
}

export const spaceMode: ModeStrategy = {
  id: "space",
  meta: getModeMeta("space"),
  getSpeed,
  getGap,

  updatePlayer(player: Player, stepRatio: number): void {
    player.velocity += PHYSICS.reverseGravity * stepRatio;
    player.velocity = clamp(
      player.velocity,
      PHYSICS.maxRiseSpeed,
      PHYSICS.maxFallSpeed,
    );
    player.y += player.velocity * stepRatio;
  },

  handleInput(player: Player): void {
    player.velocity = PHYSICS.diveForce;
  },

  drawBackground(
    ctx: CanvasRenderingContext2D,
    config: GameConfig,
    time: number,
    scroll: number,
  ): void {
    const grad = ctx.createLinearGradient(0, 0, 0, config.height);
    grad.addColorStop(0, "#0b0823");
    grad.addColorStop(0.55, "#141038");
    grad.addColorStop(1, "#1d1442");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, config.width, config.height);

    // Slow drifting planet.
    const planetX = ((config.width * 0.7 - scroll * 0.1) % (config.width + 200)) - 50;
    const pg = ctx.createRadialGradient(
      planetX - 14,
      110,
      8,
      planetX,
      120,
      54,
    );
    pg.addColorStop(0, "#ff9d6e");
    pg.addColorStop(1, "#b8533a");
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.arc(planetX, 120, 50, 0, Math.PI * 2);
    ctx.fill();

    // Star field with parallax + twinkle.
    for (let i = 0; i < 46; i++) {
      const sx = ((hash(i) * config.width - scroll * (0.2 + hash(i) * 0.3)) %
        config.width +
        config.width) %
        config.width;
      const sy = hash(i * 2) * config.height;
      const tw = 0.5 + 0.5 * Math.sin(time / 400 + i);
      ctx.fillStyle = `rgba(255,255,255,${0.3 + tw * 0.6})`;
      const r = hash(i * 7) > 0.85 ? 1.8 : 1;
      ctx.fillRect(sx, sy, r, r);
    }
  },

  drawObstacle(
    ctx: CanvasRenderingContext2D,
    obstacle: Obstacle,
    config: GameConfig,
  ): void {
    drawAsteroidPillar(
      ctx,
      obstacle.x,
      0,
      obstacle.topHeight,
      config.pipeWidth,
      obstacle.variant,
      "top",
    );
    drawAsteroidPillar(
      ctx,
      obstacle.x,
      obstacle.bottomY,
      config.height - config.groundHeight - obstacle.bottomY,
      config.pipeWidth,
      obstacle.variant,
      "bottom",
    );
  },

  drawPlayer(
    ctx: CanvasRenderingContext2D,
    player: Player,
    character: Character,
  ): void {
    const tilt = clamp(player.velocity * 0.05, -0.6, 0.6);
    drawEmojiPlayer(ctx, player, character, tilt);
  },

  drawForeground(
    ctx: CanvasRenderingContext2D,
    config: GameConfig,
    scroll: number,
  ): void {
    const y = config.height - config.groundHeight;
    const grad = ctx.createLinearGradient(0, y, 0, config.height);
    grad.addColorStop(0, "#2a2440");
    grad.addColorStop(1, "#15102b");
    ctx.fillStyle = grad;
    ctx.fillRect(0, y, config.width, config.groundHeight);

    // Jagged asteroid-belt surface.
    ctx.fillStyle = "#3a3357";
    for (let i = 0; i < 16; i++) {
      const tx = ((i * 30 - scroll) % (config.width + 30)) - 15;
      ctx.beginPath();
      ctx.moveTo(tx, y + 10);
      ctx.lineTo(tx + 8, y - 2);
      ctx.lineTo(tx + 16, y + 10);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = "rgba(120,200,255,0.5)";
    ctx.fillRect(0, y, config.width, 2);
  },
};
