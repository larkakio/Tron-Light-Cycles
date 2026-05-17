'use client';

interface GameOverModalProps {
  score: number;
  maxLevel: number;
  onRetry: () => void;
}

export function GameOverModal({ score, maxLevel, onRetry }: GameOverModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="neon-border max-w-sm rounded-2xl p-6 text-center">
        <p className="font-[family-name:var(--font-orbitron)] text-xs uppercase tracking-[0.3em] text-[var(--crimson)]">
          Derezzed
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-orbitron)] text-2xl font-black uppercase text-[var(--crimson)]">
          Game over
        </h2>
        <p className="mt-2 text-sm text-gray-300">
          Final score: {score} · Best sector: {maxLevel}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 w-full rounded-lg border border-[var(--crimson)] bg-[var(--crimson)]/20 px-4 py-3 font-[family-name:var(--font-orbitron)] text-sm font-bold uppercase tracking-widest text-red-200"
        >
          Retry sector
        </button>
      </div>
    </div>
  );
}
