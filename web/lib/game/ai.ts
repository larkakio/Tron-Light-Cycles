import type { Cell, Cycle, Direction, LevelConfig } from './types';

const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];

function turnLeft(dir: Direction): Direction {
  return ((dir + 3) % 4) as Direction;
}

function turnRight(dir: Direction): Direction {
  return ((dir + 1) % 4) as Direction;
}

function isBlocked(
  cells: Cell[][],
  width: number,
  height: number,
  x: number,
  y: number,
  cycleId: string,
): boolean {
  if (x < 0 || y < 0 || x >= width || y >= height) return true;
  const cell = cells[y]![x]!;
  if (cell.kind === 'wall') return true;
  if (cell.kind === 'trail' && cell.ownerId !== cycleId) return true;
  if (cell.kind === 'trail' && cell.ownerId === cycleId) return true;
  return false;
}

function lookAhead(
  cells: Cell[][],
  width: number,
  height: number,
  cycle: Cycle,
  dir: Direction,
  steps: number,
): number {
  let x = cycle.x;
  let y = cycle.y;
  let score = 0;
  for (let i = 0; i < steps; i++) {
    x += DX[dir]!;
    y += DY[dir]!;
    if (isBlocked(cells, width, height, x, y, cycle.id)) {
      return score - (steps - i) * 10;
    }
    score += 2;
  }
  return score;
}

export function chooseAiTurn(
  cycle: Cycle,
  cells: Cell[][],
  width: number,
  height: number,
  config: LevelConfig,
): 'left' | 'right' | null {
  if (!cycle.alive) return null;

  if (Math.random() < config.aiRandomChance) {
    return Math.random() < 0.5 ? 'left' : 'right';
  }

  const options: { turn: 'left' | 'right' | null; score: number }[] = [];

  for (const turn of [null, 'left', 'right'] as const) {
    let dir = cycle.dir;
    if (turn === 'left') dir = turnLeft(dir);
    if (turn === 'right') dir = turnRight(dir);

    const nx = cycle.x + DX[dir]!;
    const ny = cycle.y + DY[dir]!;
    if (isBlocked(cells, width, height, nx, ny, cycle.id)) {
      options.push({ turn, score: -100 });
      continue;
    }

    const ahead = lookAhead(cells, width, height, cycle, dir, 4);
    const straightBonus = turn === null ? 3 : 0;
    options.push({ turn, score: ahead + straightBonus });
  }

  options.sort((a, b) => b.score - a.score);
  const best = options[0]!;
  if (best.score < -50) return Math.random() < 0.5 ? 'left' : 'right';
  return best.turn;
}
