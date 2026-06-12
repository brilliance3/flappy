import { useEffect, useRef } from "react";
import {
  GAME_CONFIG,
  type Character,
  type GameConfig,
  type GameMode,
  type Obstacle,
  type OceanCurrent,
  type Player,
} from "../types/game";
import { hasAnyCollision } from "../utils/collision";
import { randFloat } from "../utils/random";
import { vibratePattern } from "../utils/vibration";
import { audioManager } from "../audio/audioManager";
import {
  createOceanCurrent,
  getMode,
  updateOceanCurrent,
  type ModeEnv,
} from "../modes";
import { drawScore, type ActionInput } from "../modes/shared";

interface GameCanvasProps {
  mode: GameMode;
  character: Character;
  paused: boolean;
  onGameOver: (finalScore: number) => void;
  onScoreChange?: (score: number) => void;
}

function createObstacle(
  config: GameConfig,
  gap: number,
): Obstacle {
  const minTop = 60;
  const maxTop = config.height - config.groundHeight - gap - 60;
  const topHeight = randFloat(minTop, Math.max(minTop + 1, maxTop));
  return {
    x: config.width + 20,
    topHeight,
    bottomY: topHeight + gap,
    passed: false,
    variant: Math.floor(Math.random() * 3),
  };
}

export default function GameCanvas({
  mode,
  character,
  paused,
  onGameOver,
  onScoreChange,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pausedRef = useRef(paused);

  const playerRef = useRef<Player>({
    x: GAME_CONFIG.width * 0.3,
    y: GAME_CONFIG.height * 0.45,
    radius: GAME_CONFIG.playerRadius,
    velocity: 0,
  });
  const obstaclesRef = useRef<Obstacle[]>([]);
  const scoreRef = useRef<number>(0);
  const distanceRef = useRef<number>(0);
  const gameOverRef = useRef<boolean>(false);
  const oceanRef = useRef<OceanCurrent | null>(null);

  // Keep the pause flag in a ref so toggling it never restarts the game loop.
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const config = GAME_CONFIG;
    const strategy = getMode(mode);

    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = config.width * dpr;
    canvas.height = config.height * dpr;
    canvas.style.width = `${config.width}px`;
    canvas.style.height = `${config.height}px`;
    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Fresh state for this playthrough.
    playerRef.current = {
      x: config.width * 0.3,
      y: config.height * 0.45,
      radius: config.playerRadius,
      velocity: 0,
    };
    obstaclesRef.current = [];
    scoreRef.current = 0;
    distanceRef.current = 0;
    gameOverRef.current = false;
    oceanRef.current = mode === "ocean" ? createOceanCurrent() : null;

    const env: ModeEnv = { ocean: oceanRef.current };

    // For continuous (hold-to-steer) modes we track the held input here.
    const hold: { active: boolean; pointerY?: number; intent?: "up" | "down" } =
      { active: false };

    // Instant impulse + feedback on the initial press.
    const press = (input: ActionInput) => {
      if (gameOverRef.current || pausedRef.current) return;
      strategy.handleInput(playerRef.current, input, env);
      audioManager.play("tap");
      vibratePattern("tap");
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === "Space" ||
        e.key === " " ||
        e.key === "ArrowUp" ||
        e.key === "ArrowDown"
      ) {
        e.preventDefault();
        const intent =
          e.key === "ArrowDown" ? "down" : e.key === "ArrowUp" ? "up" : undefined;
        if (strategy.continuous) {
          const wasActive = hold.active;
          hold.active = true;
          hold.intent = intent ?? "up";
          hold.pointerY = undefined;
          if (!wasActive) press({ intent: hold.intent }); // sound once on activate
        } else {
          press({ intent });
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (
        strategy.continuous &&
        (e.code === "Space" || e.key === " " || e.key === "ArrowUp" || e.key === "ArrowDown")
      ) {
        hold.active = false;
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      if (strategy.continuous) {
        hold.active = true;
        hold.pointerY = e.offsetY;
        hold.intent = undefined;
      }
      press({ pointerY: e.offsetY });
    };
    const onPointerMove = (e: PointerEvent) => {
      if (strategy.continuous && hold.active) hold.pointerY = e.offsetY;
    };
    const releaseHold = () => {
      hold.active = false;
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp);
    canvas.addEventListener("pointerdown", onPointerDown, { passive: false });
    canvas.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", releaseHold);
    canvas.addEventListener("pointercancel", releaseHold);
    canvas.addEventListener("pointerleave", releaseHold);

    let rafId = 0;
    let last = performance.now();
    const targetDt = 1000 / 60;

    const tick = (now: number) => {
      let dt = now - last;
      last = now;
      if (dt > 100) dt = 100; // clamp after tab-switches

      if (pausedRef.current) {
        // Frozen: keep the last frame on screen but don't advance physics.
        draw(now);
        rafId = requestAnimationFrame(tick);
        return;
      }

      // Advance the ocean current in real time (independent of sub-steps).
      if (oceanRef.current) {
        const { changed } = updateOceanCurrent(
          oceanRef.current,
          dt,
          scoreRef.current,
        );
        if (changed) {
          audioManager.play("button");
          vibratePattern("currentChange");
        }
      }

      const steps = Math.max(1, Math.min(3, Math.round(dt / targetDt)));
      const stepRatio = dt / (steps * targetDt);
      for (let s = 0; s < steps; s++) {
        update(stepRatio);
        if (gameOverRef.current) break;
      }

      draw(now);

      if (!gameOverRef.current) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const update = (stepRatio: number) => {
      const player = playerRef.current;
      const obstacles = obstaclesRef.current;
      const speed = strategy.getSpeed(scoreRef.current) * stepRatio;

      // Continuous steering (hold-to-swim) is applied before the mode's own
      // physics (current drift, gravity) so the player can fight the current.
      if (strategy.steer && hold.active) {
        strategy.steer(player, hold, stepRatio);
      }
      strategy.updatePlayer(player, stepRatio, env);
      distanceRef.current += speed;

      for (const obstacle of obstacles) {
        obstacle.x -= speed;
        if (!obstacle.passed && obstacle.x + config.pipeWidth < player.x) {
          obstacle.passed = true;
          scoreRef.current += 1;
          onScoreChange?.(scoreRef.current);
          audioManager.play("score");
          vibratePattern("score");
        }
      }

      while (obstacles.length > 0 && obstacles[0].x + config.pipeWidth < -20) {
        obstacles.shift();
      }

      const lastObstacle = obstacles[obstacles.length - 1];
      const spawnThreshold = config.width - config.pipeSpawnDistance;
      if (!lastObstacle || lastObstacle.x < spawnThreshold) {
        obstacles.push(createObstacle(config, strategy.getGap(scoreRef.current)));
      }

      if (hasAnyCollision(player, obstacles, config)) {
        gameOverRef.current = true;
        audioManager.play("hit");
        vibratePattern("hit");
        draw(performance.now());
        onGameOver(scoreRef.current);
      }
    };

    const draw = (now: number) => {
      const player = playerRef.current;
      const obstacles = obstaclesRef.current;
      const scroll = distanceRef.current;

      strategy.drawBackground(ctx, config, now, scroll, env);
      for (const obstacle of obstacles) {
        strategy.drawObstacle(ctx, obstacle, config);
      }
      strategy.drawForeground(ctx, config, scroll);
      strategy.drawPlayer(ctx, player, character);
      strategy.drawModeUI?.(ctx, config, env);
      drawScore(ctx, config, scoreRef.current);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", releaseHold);
      canvas.removeEventListener("pointercancel", releaseHold);
      canvas.removeEventListener("pointerleave", releaseHold);
      gameOverRef.current = true;
    };
  }, [mode, character, onGameOver, onScoreChange]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Tap Tap Tap game canvas"
      className="block mx-auto rounded-3xl shadow-2xl touch-none select-none"
    />
  );
}
