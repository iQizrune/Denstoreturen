import { AgeGroup, QA, RawQA } from './types';
import { normalizeBank } from './adapter';

function pickCityArray(byerMod: any, cityId: string): any[] {
  const m = byerMod?.default ?? byerMod;
  if (!m) return [];
  const id = cityId.toLowerCase();

  if (Array.isArray(m)) return m;
  if (m && typeof m === 'object') {
    if (Array.isArray(m[id])) return m[id];
    if (Array.isArray(m.CITIES?.[id])) return m.CITIES[id];
    if (Array.isArray(m.Byer?.[id])) return m.Byer[id];
    if (Array.isArray(m[cityId])) return m[cityId];
  }

  for (const [k, v] of Object.entries(m)) {
    if (k.toLowerCase().includes(id) && Array.isArray(v)) return v as any[];
  }

  if (m && typeof m === 'object') {
    for (const v of Object.values(m)) {
      if (typeof v === 'function') {
        try {
          const arr = (v as any)(cityId);
          if (Array.isArray(arr) && arr.length) return arr;
        } catch {}
      }
    }
  }
  return [];
}

export function loadCityBank(cityId: string, age: AgeGroup = 'voksen'): QA[] {
  try {
    const byer = require('@/src/banks/byer');
    const raw = pickCityArray(byer, cityId);
    return normalizeBank(raw as RawQA[], age);
  } catch {
    return [];
  }
}
