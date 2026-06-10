import {
  PHYSICS,
  getModeMeta,
  type Character,
  type GameConfig,
  type Obstacle,
  type Player,
} from "../types/game";
import { clamp, drawEmojiPlayer, type ModeStrategy } from "./shared";

/* ---------- Difficulty ---------- */

function getSpeed(score: number): number {
  return Math.min(2.5 + score * 0.03, 4.5);
}

function getGap(score: number): number {
  return Math.max(180 - score * 1.3, 140);
}

/* ---------- Drawing ---------- */

function drawCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
): void {
  ctx.beginPath();
  ctx.arc(x, y, 18 * scale, 0, Math.PI * 2);
  ctx.arc(x + 18 * scale, y - 8 * scale, 22 * scale, 0, Math.PI * 2);
  ctx.arc(x + 38 * scale, y, 18 * scale, 0, Math.PI * 2);
  ctx.arc(x + 22 * scale, y + 8 * scale, 18 * scale, 0, Math.PI * 2);
  ctx.fill();
}

function drawCloudPillar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  startY: number,
  height: number,
  width: number,
  tint: string,
  side: "top" | "bottom",
): void {
  if (height <= 0) return;

  ctx.fillStyle = "rgba(60, 90, 130, 0.18)";
  ctx.fillRect(cx - width / 2 + 4, startY, width, height);

  ctx.fillStyle = tint;
  const puffRadius = width / 2 + 4;
  const step = width * 0.45;
  for (let y = startY + step; y < startY + height - 2; y += step) {
    ctx.beginPath();
    ctx.arc(cx, y, puffRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  const capY = side === "top" ? startY + height : startY;
  ctx.beginPath();
  ctx.arc(cx - width * 0.3, capY, puffRadius * 0.9, 0, Math.PI * 2);
  ctx.arc(cx, capY + (side === "top" ? 6 : -6), puffRadius, 0, Math.PI * 2);
  ctx.arc(cx + width * 0.3, capY, puffRadius * 0.9, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(180, 215, 240, 0.55)";
  ctx.beginPath();
  ctx.arc(cx - width * 0.25, capY, puffRadius * 0.45, 0, Math.PI * 2);
  ctx.fill();
}

export const skyMode: ModeStrategy = {
  id: "sky",
  meta: getModeMeta("sky"),
  getSpeed,
  getGap,

  updatePlayer(player: Player, stepRatio: number): void {
    player.velocity += PHYSICS.gravity * stepRatio;
    if (player.velocity > PHYSICS.maxFallSpeed) {
      player.velocity = PHYSICS.maxFallSpeed;
    }
    player.y += player.velocity * stepRatio;
  },

  handleInput(player: Player): void {
    player.velocity = PHYSICS.jumpForce;
  },

  drawBackground(
    ctx: CanvasRenderingContext2D,
    config: GameConfig,
    time: number,
    scroll: number,
  ): void {
    const phase = (Math.sin(time / 12000) + 1) / 2;
    const skyTop = phase < 0.5 ? "#b9e3ff" : "#fbc59c";
    const grad = ctx.createLinearGradient(0, 0, 0, config.height);
    grad.addColorStop(0, skyTop);
    grad.addColorStop(0.55, "#7ec8f7");
    grad.addColorStop(1, "#5aa9e6");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, config.width, config.height);

    ctx.fillStyle = "rgba(255,255,255,0.75)";
    for (let i = 0; i < 5; i++) {
      const baseX = ((i * 130 - scroll * 0.25) % (config.width + 160)) - 80;
      drawCloud(ctx, baseX, 80 + (i % 2) * 60, 1.0);
    }
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    for (let i = 0; i < 4; i++) {
      const baseX =
        ((i * 170 + 60 - scroll * 0.6) % (config.width + 200)) - 100;
      drawCloud(ctx, baseX, 200 + (i % 2) * 80, 1.2);
    }
  },

  drawObstacle(
    ctx: CanvasRenderingContext2D,
    obstacle: Obstacle,
    config: GameConfig,
  ): void {
    const cx = obstacle.x + config.pipeWidth / 2;
    const tint =
      obstacle.variant === 0
        ? "#ffffff"
        : obstacle.variant === 1
          ? "#f3f9ff"
          : "#eaf3ff";
    drawCloudPillar(ctx, cx, 0, obstacle.topHeight, config.pipeWidth, tint, "top");
    drawCloudPillar(
      ctx,
      cx,
      obstacle.bottomY,
      config.height - config.groundHeight - obstacle.bottomY,
      config.pipeWidth,
      tint,
      "bottom",
    );
  },

  drawPlayer(
    ctx: CanvasRenderingContext2D,
    player: Player,
    character: Character,
  ): void {
    const tilt = clamp(player.velocity / 14, -0.45, 0.9);
    drawEmojiPlayer(ctx, player, character, tilt);
  },

  drawForeground(
    ctx: CanvasRenderingContext2D,
    config: GameConfig,
    scroll: number,
  ): void {
    const y = config.height - config.groundHeight;
    const grad = ctx.createLinearGradient(0, y, 0, config.height);
    grad.addColorStop(0, "#86d36b");
    grad.addColorStop(1, "#4f9d3a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, y, config.width, config.groundHeight);

    ctx.fillStyle = "#3a7a2a";
    for (let i = 0; i < 14; i++) {
      const tx = ((i * 36 - scroll) % (config.width + 36)) - 18;
      ctx.beginPath();
      ctx.moveTo(tx, y + 14);
      ctx.lineTo(tx + 6, y + 4);
      ctx.lineTo(tx + 12, y + 14);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = "#7a5235";
    ctx.fillRect(0, y + 22, config.width, 6);
  },
};
