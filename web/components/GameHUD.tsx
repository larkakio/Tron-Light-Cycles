'use client';

import type { GameSnapshot } from '@/lib/game/types';

interface GameHUDProps {
  snap: GameSnapshot | null;
}

export function GameHUD({ snap }: GameHUDProps) {
  if (!snap) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-widest sm:text-xs">
      <div className="flex gap-3">
        <span className="text-cyan-300">
          Sector <span className="glow-text-cyan font-bold">{snap.level}</span>
        </span>
        <span className="text-[var(--magenta)]">
          Score{' '}
          <span className="font-bold tabular-nums">{snap.score}</span>
        </span>
        <span className="text-amber-300">
          Lives{' '}
          <span className="font-bold tabular-nums">{snap.lives}</span>
        </span>
      </div>
      {snap.boostTicksLeft > 0 && (
        <span className="animate-pulse-border text-cyan-200">
          Boost active
        </span>
      )}
    </div>
  );
}
