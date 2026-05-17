const LEVEL_KEY = 'tron_cycles_current_level';
const MAX_LEVEL_KEY = 'tron_cycles_max_level';
const HINT_KEY = 'tron_cycles_hint_seen';

export function getSavedLevel(): number {
  if (typeof window === 'undefined') return 1;
  const v = localStorage.getItem(LEVEL_KEY);
  const n = v ? parseInt(v, 10) : 1;
  return Number.isFinite(n) && n >= 1 ? Math.min(n, 5) : 1;
}

export function saveLevel(level: number) {
  localStorage.setItem(LEVEL_KEY, String(level));
  const max = getMaxLevel();
  if (level > max) {
    localStorage.setItem(MAX_LEVEL_KEY, String(level));
  }
}

export function unlockNextSector(completedLevel: number) {
  const next = Math.min(completedLevel + 1, 5);
  if (next > getMaxLevel()) {
    localStorage.setItem(MAX_LEVEL_KEY, String(next));
  }
}

export function getMaxLevel(): number {
  if (typeof window === 'undefined') return 1;
  const v = localStorage.getItem(MAX_LEVEL_KEY);
  const n = v ? parseInt(v, 10) : 1;
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

export function hasSeenHint(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(HINT_KEY) === '1';
}

export function markHintSeen() {
  localStorage.setItem(HINT_KEY, '1');
}
