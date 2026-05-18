export interface Character {
  id: string;
  name: string;
  emoji: string;
  /** Optional tint applied to the character's halo / glow. */
  color?: string;
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

export type GameStatus = "ready" | "playing" | "gameover";

export interface GameConfig {
  width: number;
  height: number;
  gravity: number;
  jumpForce: number;
  pipeSpeed: number;
  pipeWidth: number;
  pipeGap: number;
  pipeSpawnDistance: number;
  groundHeight: number;
}

export const DEFAULT_CONFIG: GameConfig = {
  width: 390,
  height: 640,
  gravity: 0.45,
  jumpForce: -7.5,
  pipeSpeed: 2.5,
  pipeWidth: 70,
  pipeGap: 160,
  pipeSpawnDistance: 230,
  groundHeight: 80,
};
