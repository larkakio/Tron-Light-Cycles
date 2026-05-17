import type { GameSnapshot, Particle } from './types';

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  snap: GameSnapshot,
  particles: Particle[],
  width: number,
  height: number,
) {
  const { width: gw, height: gh } = snap;
  const pad = 8;
  const arenaW = width - pad * 2;
  const arenaH = height - pad * 2;
  const cellW = arenaW / gw;
  const cellH = arenaH / gh;

  ctx.clearRect(0, 0, width, height);

  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#0a0a14');
  grad.addColorStop(1, '#050508');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.translate(pad, pad);

  const vpY = arenaH * 0.15;
  for (let y = 0; y <= gh; y++) {
    const t = y / gh;
    const spread = 0.75 + t * 0.5;
    const yPos = vpY + (arenaH - vpY) * t;
    const xOff = (arenaW * (1 - spread)) / 2;
    ctx.strokeStyle = `rgba(26, 26, 46, ${0.3 + t * 0.5})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(xOff, yPos);
    ctx.lineTo(arenaW - xOff, yPos);
    ctx.stroke();
  }
  for (let x = 0; x <= gw; x++) {
    const t = x / gw;
    const xPos = arenaW * t;
    ctx.beginPath();
    ctx.moveTo(xPos, vpY);
    ctx.lineTo(xPos, arenaH);
    ctx.stroke();
  }

  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) {
      const cell = snap.cells[y]![x]!;
      const cx = x * cellW + cellW / 2;
      const cy = y * cellH + cellH / 2;
      const perspective = 0.85 + (y / gh) * 0.15;
      const px = cx;
      const py = vpY + (cy - vpY) * perspective;

      if (cell.kind === 'wall') {
        ctx.fillStyle = 'rgba(80, 40, 120, 0.7)';
        ctx.shadowColor = '#aa00ff';
        ctx.shadowBlur = 8;
        ctx.fillRect(
          px - cellW / 2,
          py - cellH / 2,
          cellW * 0.9,
          cellH * 0.9,
        );
        ctx.shadowBlur = 0;
      } else if (cell.kind === 'trail') {
        const owner = snap.cycles.find((c) => c.id === cell.ownerId);
        const col = owner?.color ?? '#00f5ff';
        ctx.strokeStyle = col;
        ctx.lineWidth = Math.max(2, cellW * 0.35);
        ctx.shadowColor = col;
        ctx.shadowBlur = 12;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(px, py, cellW * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }
    }
  }

  for (const p of particles) {
    const px = p.x * cellW + cellW / 2;
    const py = vpY + (p.y * cellH + cellH / 2 - vpY) * (0.85 + (p.y / gh) * 0.15);
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(px, py, 3 * p.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  for (const cycle of snap.cycles) {
    if (!cycle.alive) continue;
    const cx = cycle.x * cellW + cellW / 2;
    const cy = cycle.y * cellH + cellH / 2;
    const perspective = 0.85 + (cycle.y / gh) * 0.15;
    const px = cx;
    const py = vpY + (cy - vpY) * perspective;

    const dirs = [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
    ];
    const [ddx, ddy] = dirs[cycle.dir]!;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(Math.atan2(ddy, ddx) + Math.PI / 2);

    ctx.shadowColor = cycle.color;
    ctx.shadowBlur = 18;
    ctx.fillStyle = cycle.color;
    ctx.beginPath();
    ctx.moveTo(0, -cellH * 0.45);
    ctx.lineTo(cellW * 0.35, cellH * 0.35);
    ctx.lineTo(0, cellH * 0.2);
    ctx.lineTo(-cellW * 0.35, cellH * 0.35);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = cycle.rimColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  ctx.restore();
}
