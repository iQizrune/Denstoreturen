/* auto-generated util.ts to satisfy bonus.ts imports */

export function shuffle<T>(arr: T[]): T[] {
  const a = (arr||[]).slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sample<T>(arr: T[]): T | undefined {
  if (!arr || arr.length === 0) return undefined;
  const i = Math.floor(Math.random() * arr.length);
  return arr[i];
}

export function pickN<T>(arr: T[], n: number): T[] {
  const a = shuffle(arr||[]);
  const k = Math.max(0, Math.min(n|0, a.length));
  return a.slice(0, k);
}

export function ensureArray<T>(x: T | T[] | null | undefined): T[] {
  if (Array.isArray(x)) return x.slice();
  if (x == null) return [];
  return [x as T];
}

export function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr||[]));
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function range(n: number): number[] {
  const k = Math.max(0, n|0);
  return Array.from({length:k}, (_,_i)=>_i);
}

export function normalizeText(v: any): string {
  return String(v ?? '').trim();
}
