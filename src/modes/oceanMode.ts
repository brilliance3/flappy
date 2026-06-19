import {
  PHYSICS,
  getModeMeta,
  type Character,
  type CurrentDirection,
  type GameConfig,
  type Obstacle,
  type OceanCurrent,
  type Player,
} from "../types/game";
import { randInt } from "../utils/random";
import {
  clamp,
  drawEmojiPlayer,
  type ActionInput,
  type ModeEnv,
  type ModeStrategy,
} from "./shared";
import { t } from "../i18n";

/* ---------- Difficulty ---------- */

function getSpeed(score: number): number {
  return Math.min(2.2 + score * 0.035, 4.4);
}

function getGap(score: number): number {
  return Math.max(200 - score * 1.4, 150);
}

function getCurrentStrength(score: number): number {
  return Math.min(0.18 + score * 0.004, 0.38);
}

/* ---------- Current controller ---------- */

function pickDirection(score: number): CurrentDirection {
  // Neutral becomes rarer as the score climbs (game gets more demanding).
  const neutralWeight = Math.max(0.12, 0.34 - score * 0.01);
  const sideWeight = (1 - neutralWeight) / 2;
  const r = Math.random();
  if (r < sideWeight) return "up";
  if (r < sideWeight * 2) return "down";
  return "neutral";
}

export function createOceanCurrent(): OceanCurrent {
  return {
    direction: "neutral",
    strength: 0,
    remainingTime: randInt(4000, 7000),
    nextDirection: pickDirection(0),
    warning: false,
  };
}

/**
 * Advances the current by real elapsed time. Returns flags so the game loop can
 * fire a warning effect (~1s before a change) and a vibration/sound on change.
 */
export function updateOceanCurrent(
  current: OceanCurrent,
  dtMs: number,
  score: number,
): { changed: boolean; warned: boolean } {
  current.remainingTime -= dtMs;
  let warned = false;
  let changed = false;

  if (!current.warning && current.remainingTime <= 1000) {
    current.warning = true;
    warned = true;
  }

  if (current.remainingTime <= 0) {
    current.direction = current.nextDirection;
    current.strength =
      current.direction === "neutral" ? 0 : getCurrentStrength(score);
    current.remainingTime = randInt(4000, 7000);
    current.nextDirection = pickDirection(score);
    current.warning = false;
    changed = true;
  }

  return { changed, warned };
}

/* ---------- Drawing ---------- */

function hash(i: number): number {
  const x = Math.sin(i * 91.7) * 23421.13;
  return x - Math.floor(x);
}

function drawReefPillar(
  ctx: CanvasRenderingContext2D,
  x: number,
  startY: number,
  height: number,
  width: number,
  variant: number,
  side: "top" | "bottom",
): void {
  if (height <= 0) return;
  const palette =
    variant === 0
      ? ["#1f6f78", "#2b97a3"]
      : variant === 1
        ? ["#216f5a", "#2fa07c"]
        : ["#6b417a", "#9457a8"];

  const grad = ctx.createLinearGradient(x, 0, x + width, 0);
  grad.addColorStop(0, palette[0]);
  grad.addColorStop(0.5, palette[1]);
  grad.addColorStop(1, palette[0]);
  ctx.fillStyle = grad;
  ctx.fillRect(x, startY, width, height);

  // Organic bumps along the open end.
  const rimY = side === "top" ? startY + height : startY;
  ctx.fillStyle = palette[1];
  for (let i = 0; i < 4; i++) {
    const bx = x + 8 + (i / 3) * (width - 16);
    ctx.beginPath();
    ctx.arc(bx, rimY, 9, 0, Math.PI * 2);
    ctx.fill();
  }

  // Speckles for texture.
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  for (let i = 0; i < 5; i++) {
    const sx = x + 6 + hash(x + i) * (width - 12);
    const sy = startY + 12 + hash(x + i * 5) * Math.max(8, height - 24);
    ctx.fillRect(sx, sy, 2, 2);
  }
}

function directionGlyph(direction: CurrentDirection): string {
  if (direction === "up") return "↑";
  if (direction === "down") return "↓";
  return "~";
}

function directionLabel(direction: CurrentDirection): string {
  if (direction === "up") return t("cur_up");
  if (direction === "down") return t("cur_down");
  return t("cur_calm");
}

export const oceanMode: ModeStrategy = {
  id: "ocean",
  meta: getModeMeta("ocean"),
  getSpeed,
  getGap,

  updatePlayer(player: Player, stepRatio: number, env: ModeEnv): void {
    // Continuous drift = the current. Neutral drifts gently downward so that a
    // tap-to-rise still has something to push against.
    let force: number = PHYSICS.oceanNeutralGravity;
    const cur = env.ocean;
    if (cur) {
      if (cur.direction === "up") force = -cur.strength;
      else if (cur.direction === "down") force = cur.strength;
    }
    player.velocity += force * stepRatio;
    player.velocity = clamp(
      player.velocity,
      -PHYSICS.oceanSpeedClamp,
      PHYSICS.oceanSpeedClamp,
    );
    player.y += player.velocity * stepRatio;
  },

  continuous: true,

  handleInput(player: Player, input: ActionInput): void {
    // Instant nudge on the initial press so the press feels responsive; steer()
    // sustains the motion while the input is held.
    let goUp: boolean;
    if (input.intent) goUp = input.intent === "up";
    else if (input.pointerY !== undefined) goUp = input.pointerY < player.y;
    else goUp = true;
    player.velocity = goUp ? -PHYSICS.oceanKick : PHYSICS.oceanKick;
  },

  steer(player: Player, hold: ActionInput, stepRatio: number): void {
    // Press-and-hold: keep swimming toward the held direction / touch point.
    let dir: number;
    if (hold.intent) {
      dir = hold.intent === "up" ? -1 : 1;
    } else if (hold.pointerY !== undefined) {
      const dy = hold.pointerY - player.y;
      // Settle (don't oscillate) once we're near the touch point.
      if (Math.abs(dy) < 18) {
        player.velocity *= 0.85;
        return;
      }
      dir = dy < 0 ? -1 : 1;
    } else {
      dir = -1; // bare hold = rise
    }
    player.velocity += dir * PHYSICS.oceanSwim * stepRatio;
  },

  drawBackground(
    ctx: CanvasRenderingContext2D,
    config: GameConfig,
    time: number,
    scroll: number,
    env: ModeEnv,
  ): void {
    const grad = ctx.createLinearGradient(0, 0, 0, config.height);
    grad.addColorStop(0, "#39c6d6");
    grad.addColorStop(0.5, "#1f8fb5");
    grad.addColorStop(1, "#0d4f78");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, config.width, config.height);

    // Surface wave lines.
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 2;
    for (let row = 0; row < 3; row++) {
      ctx.beginPath();
      const baseY = 30 + row * 22;
      for (let x = 0; x <= config.width; x += 8) {
        const wy = baseY + Math.sin(x / 28 + time / 600 + row) * 5;
        if (x === 0) ctx.moveTo(x, wy);
        else ctx.lineTo(x, wy);
      }
      ctx.stroke();
    }

    // Prominent directional current — full-screen flowing streaks plus edge
    // chevrons so it's obvious which way (and how hard) the water is pushing.
    const dir = env.ocean?.direction ?? "neutral";
    const strength = env.ocean?.strength ?? 0;
    if (dir !== "neutral") {
      const sign = dir === "up" ? -1 : 1;
      const intensity = Math.min(strength / 0.38, 1);
      const alpha = 0.14 + intensity * 0.2;
      ctx.strokeStyle = `rgba(235,250,255,${alpha})`;
      ctx.lineWidth = 2;

      const span = config.height + 60;
      const flow = (((time * (0.05 + intensity * 0.07) * sign) % span) + span) % span;
      const cols = 9;
      for (let c = 0; c < cols; c++) {
        const x = ((c + 0.5) / cols) * config.width;
        for (let s = -1; s <= span / 60 + 1; s++) {
          const y = ((s * 60 + sign * flow) % span + span) % span - 30;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + sign * 22);
          ctx.stroke();
        }
      }

      // Pulsing chevrons on both edges pointing the way the current flows.
      const pulse = 0.5 + 0.5 * Math.sin(time / 250);
      ctx.fillStyle = `rgba(255,255,255,${0.25 + pulse * 0.4})`;
      for (const ex of [16, config.width - 16]) {
        for (let j = 0; j < 3; j++) {
          const cy = config.height / 2 + sign * (j * 16 - 16);
          ctx.beginPath();
          ctx.moveTo(ex - 7, cy + sign * 6);
          ctx.lineTo(ex, cy - sign * 6);
          ctx.lineTo(ex + 7, cy + sign * 6);
          ctx.lineTo(ex, cy - sign * 1);
          ctx.closePath();
          ctx.fill();
        }
      }
    }

    // Rising bubbles.
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    for (let i = 0; i < 22; i++) {
      const bx = (hash(i) * config.width + Math.sin(time / 900 + i) * 6) % config.width;
      const speed = 0.4 + hash(i * 3) * 0.6;
      const by =
        (config.height - ((time * speed) / 16 + hash(i * 2) * config.height)) %
        config.height;
      const r = 1.5 + hash(i * 9) * 2.5;
      ctx.beginPath();
      ctx.arc(bx, (by + config.height) % config.height, r, 0, Math.PI * 2);
      ctx.fill();
    }
    void scroll;
  },

  drawObstacle(
    ctx: CanvasRenderingContext2D,
    obstacle: Obstacle,
    config: GameConfig,
  ): void {
    drawReefPillar(
      ctx,
      obstacle.x,
      0,
      obstacle.topHeight,
      config.pipeWidth,
      obstacle.variant,
      "top",
    );
    drawReefPillar(
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
    const tilt = clamp(player.velocity / 18, -0.4, 0.4);
    drawEmojiPlayer(ctx, player, character, tilt);
  },

  drawForeground(
    ctx: CanvasRenderingContext2D,
    config: GameConfig,
    scroll: number,
  ): void {
    const y = config.height - config.groundHeight;
    const grad = ctx.createLinearGradient(0, y, 0, config.height);
    grad.addColorStop(0, "#c9a86a");
    grad.addColorStop(1, "#8a6b3b");
    ctx.fillStyle = grad;
    ctx.fillRect(0, y, config.width, config.groundHeight);

    // Swaying seaweed tufts.
    ctx.strokeStyle = "#2f7d4f";
    ctx.lineWidth = 4;
    for (let i = 0; i < 10; i++) {
      const tx = ((i * 44 - scroll) % (config.width + 44)) - 22;
      ctx.beginPath();
      ctx.moveTo(tx, y + 6);
      ctx.quadraticCurveTo(tx + 8, y - 14, tx + 2, y - 30);
      ctx.stroke();
    }
  },

  drawModeUI(
    ctx: CanvasRenderingContext2D,
    config: GameConfig,
    env: ModeEnv,
  ): void {
    const cur = env.ocean;
    if (!cur) return;

    const boxW = 150;
    const boxH = 38;
    const x = config.width - boxW - 10;
    const y = 88;

    const flash = cur.warning && Math.floor(Date.now() / 200) % 2 === 0;
    ctx.fillStyle = flash ? "rgba(255,90,90,0.85)" : "rgba(0,0,0,0.35)";
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(x, y, boxW, boxH, 10);
    } else {
      // Fallback for browsers without CanvasRenderingContext2D.roundRect.
      const r = 10;
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + boxW, y, x + boxW, y + boxH, r);
      ctx.arcTo(x + boxW, y + boxH, x, y + boxH, r);
      ctx.arcTo(x, y + boxH, x, y, r);
      ctx.arcTo(x, y, x + boxW, y, r);
    }
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = '20px system-ui, sans-serif';
    ctx.fillText(directionGlyph(cur.direction), x + 12, y + boxH / 2);
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText(directionLabel(cur.direction), x + 36, y + boxH / 2 - 6);

    ctx.font = '9px system-ui, sans-serif';
    if (cur.warning) {
      ctx.fillText(
        `${directionGlyph(cur.nextDirection)} ${directionLabel(cur.nextDirection)} ${t("change_soon")}`,
        x + 36,
        y + boxH / 2 + 8,
      );
    }
  },
};
