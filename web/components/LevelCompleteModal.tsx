'use client';

interface LevelCompleteModalProps {
  level: number;
  score: number;
  onNext: () => void;
}

export function LevelCompleteModal({
  level,
  score,
  onNext,
}: LevelCompleteModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="neon-border max-w-sm rounded-2xl p-6 text-center">
        <p className="font-[family-name:var(--font-orbitron)] text-xs uppercase tracking-[0.3em] text-cyan-400">
          Sector cleared
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-orbitron)] text-2xl font-black uppercase text-cyan-300 glow-text-cyan">
          Sector {level} complete
        </h2>
        <p className="mt-2 text-sm text-gray-300">
          Score: <span className="text-[var(--magenta)]">{score}</span>
        </p>
        <button
          type="button"
          onClick={onNext}
          className="mt-6 w-full rounded-lg bg-gradient-to-r from-cyan-600 to-[var(--magenta)] px-4 py-3 font-[family-name:var(--font-orbitron)] text-sm font-bold uppercase tracking-widest text-white shadow-[0_0_24px_rgba(0,245,255,0.4)]"
        >
          Enter sector {level + 1}
        </button>
      </div>
    </div>
  );
}
