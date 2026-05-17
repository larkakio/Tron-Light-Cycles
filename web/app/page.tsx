'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { GameCanvas } from '@/components/GameCanvas';
import { GameHUD } from '@/components/GameHUD';
import { GameOverModal } from '@/components/GameOverModal';
import { LevelCompleteModal } from '@/components/LevelCompleteModal';
import { SwipeHint } from '@/components/SwipeHint';
import { WalletBar } from '@/components/WalletBar';
import { CheckInPanel } from '@/components/CheckInPanel';
import { GameEngine } from '@/lib/game/engine';
import {
  getSavedLevel,
  getMaxLevel,
  hasSeenHint,
  markHintSeen,
  saveLevel,
  unlockNextSector,
} from '@/lib/storage';
import type { GameSnapshot } from '@/lib/game/types';

export default function Home() {
  const [level, setLevel] = useState(1);
  const [snap, setSnap] = useState<GameSnapshot | null>(null);
  const [showWin, setShowWin] = useState(false);
  const [showLose, setShowLose] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const engineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    setLevel(getSavedLevel());
    setShowHint(!hasSeenHint());
  }, []);

  const handleWin = useCallback(() => {
    unlockNextSector(level);
    setShowWin(true);
  }, [level]);

  const handleLose = useCallback(() => {
    setShowLose(true);
  }, []);

  const handleNextLevel = () => {
    const next = Math.min(level + 1, 5);
    saveLevel(next);
    setLevel(next);
    setShowWin(false);
    setCanvasKey((k) => k + 1);
  };

  const handleRetry = () => {
    setShowLose(false);
    setCanvasKey((k) => k + 1);
  };

  const dismissHint = () => {
    markHintSeen();
    setShowHint(false);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="shrink-0 border-b border-cyan-500/20 px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <p className="text-[9px] uppercase tracking-[0.35em] text-cyan-500/70">
          Base grid protocol · swipe to survive
        </p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <h1 className="font-[family-name:var(--font-orbitron)] text-sm font-black uppercase tracking-[0.2em] text-cyan-300 glow-text-cyan sm:text-base">
            Tron Light Cycles
          </h1>
          <WalletBar />
        </div>
        <div className="mt-2">
          <GameHUD snap={snap} />
        </div>
      </header>

      <main className="relative min-h-0 flex-1 px-2 py-2">
        <div className="neon-border h-full min-h-[55dvh] overflow-hidden rounded-xl bg-black/40 p-1">
          <GameCanvas
            key={canvasKey}
            level={level}
            onSnapshot={setSnap}
            onWin={handleWin}
            onLose={handleLose}
            engineRef={engineRef}
          />
        </div>
      </main>

      <footer className="shrink-0 border-t border-cyan-500/20 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <CheckInPanel />
      </footer>

      {showHint && <SwipeHint onDismiss={dismissHint} />}
      {showWin && snap && (
        <LevelCompleteModal
          level={snap.level}
          score={snap.score}
          onNext={handleNextLevel}
        />
      )}
      {showLose && snap && (
        <GameOverModal
          score={snap.score}
          maxLevel={getMaxLevel()}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
}
