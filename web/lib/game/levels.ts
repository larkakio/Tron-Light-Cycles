import type { LevelConfig } from './types';

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    width: 32,
    height: 24,
    tickMs: 140,
    enemyCount: 1,
    obstacles: [],
    aiRandomChance: 0.05,
  },
  {
    level: 2,
    width: 36,
    height: 26,
    tickMs: 120,
    enemyCount: 2,
    obstacles: [],
    aiRandomChance: 0.03,
  },
  {
    level: 3,
    width: 40,
    height: 28,
    tickMs: 100,
    enemyCount: 3,
    obstacles: [],
    aiRandomChance: 0.02,
  },
  {
    level: 4,
    width: 42,
    height: 30,
    tickMs: 90,
    enemyCount: 3,
    obstacles: [
      { x: 21, y: 10 },
      { x: 21, y: 11 },
      { x: 21, y: 12 },
      { x: 21, y: 18 },
      { x: 21, y: 19 },
      { x: 21, y: 20 },
    ],
    aiRandomChance: 0.01,
  },
  {
    level: 5,
    width: 42,
    height: 30,
    tickMs: 80,
    enemyCount: 3,
    obstacles: [
      { x: 14, y: 15 },
      { x: 15, y: 15 },
      { x: 28, y: 15 },
      { x: 29, y: 15 },
      { x: 21, y: 8 },
      { x: 21, y: 22 },
    ],
    aiRandomChance: 0,
  },
];

export function getLevelConfig(level: number): LevelConfig {
  const idx = Math.min(level - 1, LEVELS.length - 1);
  return LEVELS[idx]!;
}
