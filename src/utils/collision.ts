import type { GameConfig, Obstacle, Player } from "../types/game";

/**
 * Axis-aligned bounding-box collision check between the player (treated as a
 * circle approximated by its bounding box) and a vertical obstacle column.
 *
 * The obstacle is split into a top rectangle and a bottom rectangle. The bird
 * has to fit through the gap between them.
 */
export function isCollidingWithObstacle(
  player: Player,
  obstacle: Obstacle,
  config: GameConfig,
): boolean {
  const left = player.x - player.radius;
  const right = player.x + player.radius;
  const top = player.y - player.radius;
  const bottom = player.y + player.radius;

  const withinHorizontalRange =
    right > obstacle.x && left < obstacle.x + config.pipeWidth;

  if (!withinHorizontalRange) {
    return false;
  }

  const hitsTop = top < obstacle.topHeight;
  const hitsBottom = bottom > obstacle.bottomY;

  return hitsTop || hitsBottom;
}

/** Game over when the bird touches the ceiling or the ground. */
export function isOutOfBounds(player: Player, config: GameConfig): boolean {
  const ceilingHit = player.y - player.radius <= 0;
  const groundHit =
    player.y + player.radius >= config.height - config.groundHeight;
  return ceilingHit || groundHit;
}

/** Convenience helper used by the game loop. */
export function hasAnyCollision(
  player: Player,
  obstacles: Obstacle[],
  config: GameConfig,
): boolean {
  if (isOutOfBounds(player, config)) return true;
  for (const obstacle of obstacles) {
    if (isCollidingWithObstacle(player, obstacle, config)) return true;
  }
  return false;
}
