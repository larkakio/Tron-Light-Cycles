export type Direction = 0 | 1 | 2 | 3; // N E S W

export type CellKind = 'empty' | 'wall' | 'trail';

export interface Cell {
  kind: CellKind;
  ownerId?: string;
}

export type GamePhase = 'playing' | 'paused' | 'won' | 'lost';

export interface Cycle {
  id: string;
  isPlayer: boolean;
  x: number;
  y: number;
  dir: Direction;
  alive: boolean;
  pendingTurn: 'left' | 'right' | null;
  color: string;
  rimColor: string;
}

export interface LevelConfig {
  level: number;
  width: number;
  height: number;
  tickMs: number;
  enemyCount: number;
  obstacles: { x: number; y: number }[];
  aiRandomChance: number;
}

export interface GameSnapshot {
  width: number;
  height: number;
  cells: Cell[][];
  cycles: Cycle[];
  phase: GamePhase;
  level: number;
  score: number;
  lives: number;
  tick: number;
  boostTicksLeft: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}
