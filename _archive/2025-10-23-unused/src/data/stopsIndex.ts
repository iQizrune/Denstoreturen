type Stop = { id: string; name: string; at: number };

function num(x: any): number {
  const n = Number(x); return Number.isFinite(n) ? n : 0;
}
function str(x: any): string {
  return typeof x === 'string' ? x : (x?.toString?.() ?? '');
}

function discover(): Stop[] {
  try {
    const mod = require('@/src/data/stops');
    const m = mod?.default ?? mod;

    if (Array.isArray(m)) {
      return m
        .map((it: any) => ({ id: str(it.id).toLowerCase(), name: str(it.name), at: num(it.at ?? it.meters ?? it.km ? Number(it.km)*1000 : 0) }))
        .filter(s => s.id && s.name && s.at >= 0)
        .sort((a: Stop, b: Stop) => a.at - b.at);
    }

    if (m && typeof m === 'object') {
      const arr: any[] =
        Array.isArray(m.STOPS) ? m.STOPS :
        Array.isArray(m.STOP_LIST) ? m.STOP_LIST :
        Array.isArray(m.STOP_CUM_METERS) ? m.STOP_CUM_METERS :
        Array.isArray(m.default) ? m.default : [];
      if (Array.isArray(arr) && arr.length) {
        return arr
          .map((it: any) => ({ id: str(it.id || it.key || it.slug || it.name).toLowerCase(), name: str(it.name || it.title || it.city || it.id), at: num(it.at ?? it.meters ?? it.cum ?? it.km ? Number(it.km)*1000 : 0) }))
          .filter((s: Stop) => s.id && s.name && s.at >= 0)
          .sort((a: Stop, b: Stop) => a.at - b.at);
      }
    }
  } catch {}
  return [{ id: 'lillehammer', name: 'Lillehammer', at: 300 }];
}

const STOPS: Stop[] = discover();

export function getStops(): Stop[] { return STOPS.slice(); }
export function getStopByIndex(i: number): Stop | null { return i>=0 && i<STOPS.length ? STOPS[i] : null; }
export function findNextStop(totalMeters: number, fromIndex = 0): { stop: Stop | null; index: number } {
  for (let i = fromIndex; i < STOPS.length; i++) {
    if (totalMeters < STOPS[i].at) return { stop: STOPS[i], index: i };
  }
  return { stop: null, index: STOPS.length };
}
export type { Stop };
