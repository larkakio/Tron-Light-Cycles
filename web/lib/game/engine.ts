import { chooseAiTurn } from './ai';
import { getLevelConfig } from './levels';
import type {
  Cell,
  Cycle,
  Direction,
  GamePhase,
  GameSnapshot,
  LevelConfig,
  Particle,
} from './types';

const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];

const ENEMY_COLORS = [
  { color: '#ffaa00', rim: '#ff6600' },
  { color: '#ff2244', rim: '#ff0066' },
  { color: '#ff44ff', rim: '#aa00ff' },
];

function turnLeft(dir: Direction): Direction {
  return ((dir + 3) % 4) as Direction;
}

function turnRight(dir: Direction): Direction {
  return ((dir + 1) % 4) as Direction;
}

function createGrid(w: number, h: number): Cell[][] {
  return Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({ kind: 'empty' as const })),
  );
}

function spawnPositions(
  w: number,
  h: number,
  count: number,
): { x: number; y: number; dir: Direction }[] {
  const spots: { x: number; y: number; dir: Direction }[] = [
    { x: 3, y: Math.floor(h / 2), dir: 1 },
    { x: w - 4, y: Math.floor(h / 2), dir: 3 },
    { x: Math.floor(w / 2), y: 3, dir: 2 },
    { x: Math.floor(w / 2), y: h - 4, dir: 0 },
  ];
  return spots.slice(0, count);
}

export class GameEngine {
  private config: LevelConfig;
  private cells: Cell[][];
  private cycles: Cycle[] = [];
  private phase: GamePhase = 'playing';
  private score = 0;
  private lives = 3;
  private tick = 0;
  private boostTicksLeft = 0;
  private particles: Particle[] = [];
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<(snap: GameSnapshot) => void> = new Set();

  constructor(
    public level: number,
    private onWin?: () => void,
    private onLose?: () => void,
  ) {
    this.config = getLevelConfig(level);
    this.cells = createGrid(this.config.width, this.config.height);
    this.initLevel();
  }

  subscribe(fn: (snap: GameSnapshot) => void) {
    this.listeners.add(fn);
    fn(this.snapshot());
    return () => this.listeners.delete(fn);
  }

  private emit() {
    const snap = this.snapshot();
    for (const fn of this.listeners) fn(snap);
  }

  snapshot(): GameSnapshot {
    return {
      width: this.config.width,
      height: this.config.height,
      cells: this.cells.map((row) => row.map((c) => ({ ...c }))),
      cycles: this.cycles.map((c) => ({ ...c })),
      phase: this.phase,
      level: this.config.level,
      score: this.score,
      lives: this.lives,
      tick: this.tick,
      boostTicksLeft: this.boostTicksLeft,
    };
  }

  getParticles(): Particle[] {
    return this.particles;
  }

  private initLevel() {
    this.config = getLevelConfig(this.level);
    this.cells = createGrid(this.config.width, this.config.height);
    for (const o of this.config.obstacles) {
      if (this.cells[o.y]?.[o.x]) {
        this.cells[o.y]![o.x] = { kind: 'wall' };
      }
    }

    const spawns = spawnPositions(
      this.config.width,
      this.config.height,
      1 + this.config.enemyCount,
    );

    this.cycles = [];
    const playerSpawn = spawns[0]!;
    this.cycles.push({
      id: 'player',
      isPlayer: true,
      x: playerSpawn.x,
      y: playerSpawn.y,
      dir: playerSpawn.dir,
      alive: true,
      pendingTurn: null,
      color: '#00f5ff',
      rimColor: '#ff00aa',
    });

    for (let i = 0; i < this.config.enemyCount; i++) {
      const s = spawns[i + 1]!;
      const pal = ENEMY_COLORS[i % ENEMY_COLORS.length]!;
      this.cycles.push({
        id: `enemy-${i}`,
        isPlayer: false,
        x: s.x,
        y: s.y,
        dir: s.dir,
        alive: true,
        pendingTurn: null,
        color: pal.color,
        rimColor: pal.rim,
      });
    }

    this.phase = 'playing';
    this.tick = 0;
    this.boostTicksLeft = 0;
    this.particles = [];
  }

  start() {
    this.stop();
    const ms =
      this.boostTicksLeft > 0
        ? Math.max(50, this.config.tickMs - 40)
        : this.config.tickMs;
    this.intervalId = setInterval(() => this.step(), ms);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  pause() {
    this.phase = 'paused';
    this.stop();
    this.emit();
  }

  resume() {
    if (this.phase === 'paused') {
      this.phase = 'playing';
      this.start();
      this.emit();
    }
  }

  queueTurn(side: 'left' | 'right') {
    const player = this.cycles.find((c) => c.isPlayer && c.alive);
    if (!player || this.phase !== 'playing') return;
    if (player.pendingTurn) return;
    player.pendingTurn = side;
  }

  boost() {
    if (this.phase !== 'playing') return;
    this.boostTicksLeft = 8;
    this.stop();
    this.start();
  }

  restartLevel() {
    this.initLevel();
    this.start();
    this.emit();
  }

  nextLevel() {
    this.level = Math.min(this.level + 1, 5);
    this.initLevel();
    this.start();
    this.emit();
  }

  setLevel(level: number) {
    this.level = level;
    this.initLevel();
    this.start();
    this.emit();
  }

  private applyTurn(cycle: Cycle) {
    if (cycle.pendingTurn === 'left') cycle.dir = turnLeft(cycle.dir);
    if (cycle.pendingTurn === 'right') cycle.dir = turnRight(cycle.dir);
    cycle.pendingTurn = null;
  }

  private isCollision(x: number, y: number, cycleId: string): boolean {
    const { width, height } = this.config;
    if (x < 0 || y < 0 || x >= width || y >= height) return true;
    const cell = this.cells[y]![x]!;
    if (cell.kind === 'wall') return true;
    if (cell.kind === 'trail') return true;
    return false;
  }

  private spawnParticles(x: number, y: number, color: string) {
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * 0.15,
        vy: Math.sin(angle) * 0.15,
        life: 1,
        color,
      });
    }
  }

  private derezz(cycle: Cycle) {
    cycle.alive = false;
    this.spawnParticles(cycle.x, cycle.y, cycle.color);
    if (!cycle.isPlayer) {
      this.score += 500;
    }
    for (let y = 0; y < this.config.height; y++) {
      for (let x = 0; x < this.config.width; x++) {
        const cell = this.cells[y]![x]!;
        if (cell.kind === 'trail' && cell.ownerId === cycle.id) {
          this.cells[y]![x] = { kind: 'empty' };
        }
      }
    }
  }

  private moveCycle(cycle: Cycle) {
    if (!cycle.alive) return;

    this.applyTurn(cycle);

    const trailX = cycle.x;
    const trailY = cycle.y;
    this.cells[trailY]![trailX] = { kind: 'trail', ownerId: cycle.id };

    const nx = cycle.x + DX[cycle.dir]!;
    const ny = cycle.y + DY[cycle.dir]!;

    if (this.isCollision(nx, ny, cycle.id)) {
      this.derezz(cycle);
      return;
    }

    cycle.x = nx;
    cycle.y = ny;
  }

  private step() {
    if (this.phase !== 'playing') return;

    for (const cycle of this.cycles) {
      if (!cycle.isPlayer && cycle.alive) {
        const turn = chooseAiTurn(
          cycle,
          this.cells,
          this.config.width,
          this.config.height,
          this.config,
        );
        if (turn) cycle.pendingTurn = turn;
      }
    }

    const order = [...this.cycles].sort((a, b) =>
      a.isPlayer === b.isPlayer ? 0 : a.isPlayer ? -1 : 1,
    );
    for (const cycle of order) {
      this.moveCycle(cycle);
    }

    this.tick++;
    if (this.boostTicksLeft > 0) {
      this.boostTicksLeft--;
      if (this.boostTicksLeft === 0) {
        this.stop();
        this.start();
      }
    }

    this.particles = this.particles
      .map((p) => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        life: p.life - 0.06,
      }))
      .filter((p) => p.life > 0);

    const player = this.cycles.find((c) => c.isPlayer);
    const enemiesAlive = this.cycles.filter((c) => !c.isPlayer && c.alive);

    if (player && !player.alive) {
      this.lives--;
      if (this.lives <= 0) {
        this.phase = 'lost';
        this.stop();
        this.onLose?.();
      } else {
        this.initLevel();
      }
    } else if (enemiesAlive.length === 0) {
      this.phase = 'won';
      this.score += 1000;
      this.stop();
      this.onWin?.();
    }

    this.emit();
  }

  destroy() {
    this.stop();
    this.listeners.clear();
  }
}
