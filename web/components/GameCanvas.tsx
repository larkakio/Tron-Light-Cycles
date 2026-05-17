'use client';

import { useCallback, useEffect, useRef } from 'react';
import { GameEngine } from '@/lib/game/engine';
import { renderFrame } from '@/lib/game/renderer';
import type { GameSnapshot } from '@/lib/game/types';

const SWIPE_MIN = 40;
const SWIPE_MAX_MS = 400;

interface GameCanvasProps {
  level: number;
  paused?: boolean;
  onSnapshot: (snap: GameSnapshot) => void;
  onWin: () => void;
  onLose: () => void;
  engineRef?: React.MutableRefObject<GameEngine | null>;
}

export function GameCanvas({
  level,
  paused = false,
  onSnapshot,
  onWin,
  onLose,
  engineRef,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineInnerRef = useRef<GameEngine | null>(null);
  const touchRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const rafRef = useRef<number>(0);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const dpr = window.devicePixelRatio || 1;
    const w = parent.clientWidth;
    const h = Math.max(parent.clientHeight, 320);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  useEffect(() => {
    resize();
    const ro = new ResizeObserver(resize);
    const parent = canvasRef.current?.parentElement;
    if (parent) ro.observe(parent);
    return () => ro.disconnect();
  }, [resize]);

  const onWinRef = useRef(onWin);
  const onLoseRef = useRef(onLose);
  const onSnapshotRef = useRef(onSnapshot);
  onWinRef.current = onWin;
  onLoseRef.current = onLose;
  onSnapshotRef.current = onSnapshot;

  useEffect(() => {
    engineInnerRef.current?.destroy();
    const engine = new GameEngine(
      level,
      () => onWinRef.current(),
      () => onLoseRef.current(),
    );
    engineInnerRef.current = engine;
    if (engineRef) engineRef.current = engine;

    const unsub = engine.subscribe((snap) => {
      onSnapshotRef.current(snap);
    });

    if (!paused) engine.start();

    const loop = () => {
      const canvas = canvasRef.current;
      const eng = engineInnerRef.current;
      if (canvas && eng) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.clientWidth;
          const h = canvas.clientHeight;
          renderFrame(
            ctx,
            eng.snapshot(),
            eng.getParticles(),
            w,
            h,
          );
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      unsub();
      engine.destroy();
      engineInnerRef.current = null;
      if (engineRef) engineRef.current = null;
    };
  }, [level, paused, engineRef]);

  useEffect(() => {
    const eng = engineInnerRef.current;
    if (!eng) return;
    if (paused) eng.pause();
    else eng.resume();
  }, [paused]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    touchRef.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchRef.current;
    touchRef.current = null;
    const t = e.changedTouches[0];
    if (!start || !t) return;

    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    const dt = Date.now() - start.t;
    if (dt > SWIPE_MAX_MS) return;

    const eng = engineInnerRef.current;
    if (!eng) return;

    if (Math.abs(dx) >= SWIPE_MIN && Math.abs(dx) > Math.abs(dy)) {
      eng.queueTurn(dx < 0 ? 'left' : 'right');
    } else if (dy < -SWIPE_MIN && Math.abs(dy) > Math.abs(dx)) {
      eng.boost();
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="block w-full touch-none rounded-lg"
      style={{ touchAction: 'none' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Light cycle arena — swipe left or right to turn, swipe up to boost"
    />
  );
}
