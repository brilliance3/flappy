import { useEffect, useRef } from "react";
import {
  DEFAULT_CONFIG,
  type Character,
  type GameConfig,
  type Obstacle,
  type Player,
} from "../types/game";
import { hasAnyCollision } from "../utils/collision";
import { randFloat } from "../utils/random";

interface GameCanvasProps {
  character: Character;
  onGameOver: (finalScore: number) => void;
  onScoreChange?: (score: number) => void;
}

/**
 * Difficulty curve — the pipe speed grows gently with score so the first 10
 * points feel easy and the game ramps up after that. Caps out at 4.5.
 */
function getPipeSpeed(score: number): number {
  return Math.min(DEFAULT_CONFIG.pipeSpeed + score * 0.03, 4.5);
}

function getPipeGap(score: number): number {
  // Start at 180 (forgiving) and shrink toward 140 by score ~30.
  return Math.max(180 - score * 1.3, 140);
}

function createObstacle(config: GameConfig, score: number): Obstacle {
  const minTop = 60;
  const maxTop = config.height - config.groundHeight - getPipeGap(score) - 60;
  const topHeight = randFloat(minTop, Math.max(minTop + 1, maxTop));
  return {
    x: config.width + 20,
    topHeight,
    bottomY: topHeight + getPipeGap(score),
    passed: false,
    variant: Math.floor(Math.random() * 3),
  };
}

/* ---------- Drawing helpers ---------- */

function drawBackground(
  ctx: CanvasRenderingContext2D,
  config: GameConfig,
  time: number,
  cloudOffset: number,
): void {
  // Sky gradient — drifts subtly to a warmer tone as time passes.
  const phase = (Math.sin(time / 12000) + 1) / 2; // 0..1
  const skyTop = phase < 0.5 ? "#b9e3ff" : "#fbc59c";
  const skyMid = "#7ec8f7";
  const skyBottom = "#5aa9e6";

  const grad = ctx.createLinearGradient(0, 0, 0, config.height);
  grad.addColorStop(0, skyTop);
  grad.addColorStop(0.55, skyMid);
  grad.addColorStop(1, skyBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, config.width, config.height);

  // Distant clouds — parallax slow.
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  for (let i = 0; i < 5; i++) {
    const baseX = ((i * 130 - cloudOffset * 0.25) % (config.width + 160)) - 80;
    const y = 80 + (i % 2) * 60;
    drawCloud(ctx, baseX, y, 1.0);
  }
  // Closer clouds — parallax faster.
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  for (let i = 0; i < 4; i++) {
    const baseX =
      ((i * 170 + 60 - cloudOffset * 0.6) % (config.width + 200)) - 100;
    const y = 200 + (i % 2) * 80;
    drawCloud(ctx, baseX, y, 1.2);
  }
}

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

function drawGround(
  ctx: CanvasRenderingContext2D,
  config: GameConfig,
  groundOffset: number,
): void {
  const y = config.height - config.groundHeight;
  const grad = ctx.createLinearGradient(0, y, 0, config.height);
  grad.addColorStop(0, "#86d36b");
  grad.addColorStop(1, "#4f9d3a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, y, config.width, config.groundHeight);

  // Grass tufts that scroll with the obstacles for parallax.
  ctx.fillStyle = "#3a7a2a";
  for (let i = 0; i < 14; i++) {
    const tx = ((i * 36 - groundOffset) % (config.width + 36)) - 18;
    ctx.beginPath();
    ctx.moveTo(tx, y + 14);
    ctx.lineTo(tx + 6, y + 4);
    ctx.lineTo(tx + 12, y + 14);
    ctx.closePath();
    ctx.fill();
  }

  // Earth strip under the grass.
  ctx.fillStyle = "#7a5235";
  ctx.fillRect(0, y + 22, config.width, 6);
}

/**
 * Draws an obstacle as a stack of soft cloud puffs forming a vertical pillar —
 * gives the game its own visual identity instead of green pipes.
 */
function drawObstacle(
  ctx: CanvasRenderingContext2D,
  obstacle: Obstacle,
  config: GameConfig,
): void {
  const x = obstacle.x;
  const w = config.pipeWidth;
  const cx = x + w / 2;

  // Slight color variation per obstacle.
  const tint =
    obstacle.variant === 0
      ? "#ffffff"
      : obstacle.variant === 1
        ? "#f3f9ff"
        : "#eaf3ff";

  // ----- Top pillar -----
  drawCloudPillar(ctx, cx, 0, obstacle.topHeight, w, tint, "top");
  // ----- Bottom pillar -----
  drawCloudPillar(
    ctx,
    cx,
    obstacle.bottomY,
    config.height - config.groundHeight - obstacle.bottomY,
    w,
    tint,
    "bottom",
  );
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

  // Soft column shadow.
  ctx.fillStyle = "rgba(60, 90, 130, 0.18)";
  ctx.fillRect(cx - width / 2 + 4, startY, width, height);

  ctx.fillStyle = tint;
  // Stack of puffs covers the column with rounded edges.
  const puffRadius = width / 2 + 4;
  const step = width * 0.45;
  for (let y = startY + step; y < startY + height - 2; y += step) {
    ctx.beginPath();
    ctx.arc(cx, y, puffRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cap — a fluffier crown on the open end of the pillar.
  const capY = side === "top" ? startY + height : startY;
  ctx.beginPath();
  ctx.arc(cx - width * 0.3, capY, puffRadius * 0.9, 0, Math.PI * 2);
  ctx.arc(cx, capY + (side === "top" ? 6 : -6), puffRadius, 0, Math.PI * 2);
  ctx.arc(cx + width * 0.3, capY, puffRadius * 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Sky-blue inner shadow gives the cloud some depth.
  ctx.fillStyle = "rgba(180, 215, 240, 0.55)";
  ctx.beginPath();
  ctx.arc(cx - width * 0.25, capY, puffRadius * 0.45, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  player: Player,
  character: Character,
): void {
  ctx.save();
  ctx.translate(player.x, player.y);

  // Tilt according to vertical velocity for that "flapping" feel.
  const tilt = Math.max(-0.45, Math.min(0.9, player.velocity / 14));
  ctx.rotate(tilt);

  // Glow halo behind the character.
  const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, player.radius + 14);
  glow.addColorStop(0, `${character.color ?? "#ffd84d"}aa`);
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, player.radius + 14, 0, Math.PI * 2);
  ctx.fill();

  // Emoji as the body of the flyer — keeps the look friendly and avoids
  // shipping sprite assets.
  ctx.font = `${player.radius * 2.3}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(character.emoji, 0, 2);

  ctx.restore();
}

function drawScore(
  ctx: CanvasRenderingContext2D,
  config: GameConfig,
  score: number,
): void {
  ctx.save();
  ctx.textAlign = "center";
  ctx.font = '28px "Press Start 2P", system-ui, sans-serif';
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillText(String(score), config.width / 2 + 2, 70);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(String(score), config.width / 2, 68);
  ctx.restore();
}

/* ---------- Component ---------- */

export default function GameCanvas({
  character,
  onGameOver,
  onScoreChange,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // We pin all of the mutable game state in refs so that the loop closure
  // never goes stale and we don't trigger React re-renders for each frame.
  const playerRef = useRef<Player>({
    x: DEFAULT_CONFIG.width * 0.3,
    y: DEFAULT_CONFIG.height * 0.45,
    radius: 18,
    velocity: 0,
  });
  const obstaclesRef = useRef<Obstacle[]>([]);
  const scoreRef = useRef<number>(0);
  const distanceRef = useRef<number>(0);
  const gameOverRef = useRef<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const config = DEFAULT_CONFIG;

    // Match the canvas backing store to devicePixelRatio for crispness.
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = config.width * dpr;
    canvas.height = config.height * dpr;
    canvas.style.width = `${config.width}px`;
    canvas.style.height = `${config.height}px`;
    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Reset state for this mount.
    playerRef.current = {
      x: config.width * 0.3,
      y: config.height * 0.45,
      radius: 18,
      velocity: 0,
    };
    obstaclesRef.current = [];
    scoreRef.current = 0;
    distanceRef.current = 0;
    gameOverRef.current = false;

    const flap = () => {
      if (gameOverRef.current) return;
      playerRef.current.velocity = config.jumpForce;
    };

    /* ---- Input handlers ---- */
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === " " || e.key === "ArrowUp") {
        e.preventDefault();
        flap();
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      flap();
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    canvas.addEventListener("pointerdown", onPointerDown, { passive: false });

    /* ---- Game loop ---- */
    let rafId = 0;
    let last = performance.now();
    const targetDt = 1000 / 60;

    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      // Decouple physics from frame rate by scaling step counts.
      const steps = Math.max(1, Math.min(3, Math.round(dt / targetDt)));
      const stepRatio = dt / (steps * targetDt);

      for (let s = 0; s < steps; s++) {
        update(stepRatio, now);
        if (gameOverRef.current) break;
      }

      draw(now);

      if (!gameOverRef.current) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const update = (stepRatio: number, _now: number) => {
      const player = playerRef.current;
      const obstacles = obstaclesRef.current;
      const speed = getPipeSpeed(scoreRef.current) * stepRatio;

      // Physics.
      player.velocity += config.gravity * stepRatio;
      // Cap fall speed a little so very long drops still feel survivable.
      if (player.velocity > 11) player.velocity = 11;
      player.y += player.velocity * stepRatio;

      distanceRef.current += speed;

      // Move obstacles and detect when the player passes them.
      for (const obstacle of obstacles) {
        obstacle.x -= speed;
        if (!obstacle.passed && obstacle.x + config.pipeWidth < player.x) {
          obstacle.passed = true;
          scoreRef.current += 1;
          onScoreChange?.(scoreRef.current);
        }
      }
      // Drop obstacles that have left the screen.
      while (
        obstacles.length > 0 &&
        obstacles[0].x + config.pipeWidth < -20
      ) {
        obstacles.shift();
      }
      // Spawn new ones at a steady horizontal cadence.
      const lastObstacle = obstacles[obstacles.length - 1];
      const spawnThreshold = config.width - config.pipeSpawnDistance;
      if (!lastObstacle || lastObstacle.x < spawnThreshold) {
        obstacles.push(createObstacle(config, scoreRef.current));
      }

      // Collision check.
      if (hasAnyCollision(player, obstacles, config)) {
        gameOverRef.current = true;
        // Final draw shows the resting state with the player on/just past the
        // collision frame.
        draw(performance.now());
        onGameOver(scoreRef.current);
      }
    };

    const draw = (now: number) => {
      const player = playerRef.current;
      const obstacles = obstaclesRef.current;

      drawBackground(ctx, config, now, distanceRef.current);

      for (const obstacle of obstacles) {
        drawObstacle(ctx, obstacle, config);
      }

      drawGround(ctx, config, distanceRef.current);
      drawPlayer(ctx, player, character);
      drawScore(ctx, config, scoreRef.current);
    };

    // Kick off.
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("keydown", onKeyDown);
      canvas.removeEventListener("pointerdown", onPointerDown);
      gameOverRef.current = true;
    };
  }, [character, onGameOver, onScoreChange]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Tap Wing Runner game canvas"
      className="block mx-auto rounded-3xl shadow-2xl bg-sky-200 touch-none select-none"
    />
  );
}
