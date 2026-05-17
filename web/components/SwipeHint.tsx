'use client';

interface SwipeHintProps {
  onDismiss: () => void;
}

export function SwipeHint({ onDismiss }: SwipeHintProps) {
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/60 p-6 pb-24 sm:items-center">
      <div className="neon-border max-w-xs rounded-xl p-5 text-center">
        <p className="font-[family-name:var(--font-orbitron)] text-sm font-bold uppercase text-cyan-300">
          Swipe controls
        </p>
        <ul className="mt-3 space-y-2 text-left text-xs text-gray-300">
          <li>← Swipe left — turn left</li>
          <li>→ Swipe right — turn right</li>
          <li>↑ Swipe up — speed boost</li>
        </ul>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-4 w-full rounded border border-cyan-500/50 py-2 text-xs uppercase tracking-widest text-cyan-200"
        >
          Enter the grid
        </button>
      </div>
    </div>
  );
}

