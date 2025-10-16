import { QA, RawQA, RawOption, AgeGroup } from './types';
import { getProfile } from '@/src/state/profile';
import { BANKS as LOCAL_BANKS } from './local';

function asArray<T = any>(x: any): T[] {
  if (Array.isArray(x)) return x;
  if (x && typeof x === 'object') return Object.values(x);
  return [];
}

function pickLabel(obj: any): string {
  if (obj == null) return '';
  const keys = ['text','label','title','name','value'];
  for (const k of keys) {
    const v = (obj as any)[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  const s = String((obj as any)?.toString?.() ?? '');
  return s && s !== '[object Object]' ? s : '';
}

function flagToBool(v: any): boolean {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v === 1;
  if (typeof v === 'string') return v.toLowerCase() === 'true';
  return false;
}

function findCorrectFromOptions(opts: RawOption[], choices: string[]): string {
  for (const o of opts) {
    if (o && typeof o === 'object') {
      const cand = pickLabel(o);
      const flags = ['correct','isCorrect','ok','right','a'];
      for (const f of flags) {
        if (f in (o as any) && flagToBool((o as any)[f])) {
          if (cand) return cand;
        }
      }
    }
  }
  return choices[0] ?? '';
}

function normalizeOne(it: RawQA): QA | null {
  const q = String((it as any).q ?? (it as any).question ?? (it as any).prompt ?? (it as any).text ?? '').trim();
  let choices: string[] = [];
  const opts = asArray<RawOption>((it as any).options ?? (it as any).choices ?? (it as any).answers ?? (it as any).alts);
  if (opts.length && typeof opts[0] === 'object') {
    choices = opts.map(o => pickLabel(o)).filter(Boolean);
  } else if (opts.length) {
    choices = (opts as any[]).map((x: any) => String(x));
  } else if (typeof (it as any).choices === 'string') {
    choices = String((it as any).choices).split('|').map((s: string) => s.trim()).filter(Boolean);
  }

  let a = String((it as any).a ?? (it as any).answer ?? (it as any).correct ?? '').trim();
  if (!a && opts.length) a = findCorrectFromOptions(opts, choices);
  const idxs = [(it as any).correctIndex, (it as any).answerIndex, (it as any).correct_idx, (it as any).correctOption];
  for (const pos of idxs) {
    if (a) break;
    if (typeof pos === 'number' && choices[pos]) a = choices[pos];
  }

  if (!q || choices.length < 2) return null;
  if (!a) a = choices[0];
  return { q, a, choices };
}

function ageOrder(a: AgeGroup): number {
  return a === 'barn' ? 0 : a === 'ung' ? 1 : 2;
}

function passAgeFilter(item: RawQA, userAge: AgeGroup): boolean {
  const ua = ageOrder(userAge);
  const it: any = item;
  if (it.age) return ageOrder(it.age) === ua;
  if (it.minAge && ua < ageOrder(it.minAge)) return false;
  if (it.maxAge && ua > ageOrder(it.maxAge)) return false;
  return true;
}

export function normalizeBank(raw: any, userAge: AgeGroup): QA[] {
  const items = asArray<RawQA>(raw);
  const out: QA[] = [];
  for (const it of items) {
    if (!passAgeFilter(it, userAge)) continue;
    const n = normalizeOne(it);
    if (n) out.push(n);
  }
  return out;
}

function collectFromModule(mod: any, prefix: string, acc: Record<string, any>) {
  if (!mod) return;
  const m = mod.default ?? mod;
  if (Array.isArray(m)) {
    acc[prefix] = m;
    return;
  }
  if (m && typeof m === 'object') {
    for (const [k, v] of Object.entries(m)) {
      if (Array.isArray(v)) {
        const key = `${prefix}:${k}`.toLowerCase();
        acc[key] = v;
      }
      if (typeof v === 'function' && k.toLowerCase().includes('bank')) {
        const cats = ['general','kunst','sport','historie','musikk','geografi','flagg'];
        for (const c of cats) {
          try {
            const arr = (v as any)(c);
            if (Array.isArray(arr) && arr.length) {
              acc[`${prefix}:${k}:${c}`.toLowerCase()] = arr;
            }
          } catch {}
        }
      }
    }
  }
}

function discoverSources(): Record<string, any> {
  const acc: Record<string, any> = {};

  // local
  const local = LOCAL_BANKS as any;
  if (local && typeof local === 'object') {
    for (const [k, v] of Object.entries(local)) {
      if (Array.isArray(v)) acc[k.toLowerCase()] = v;
    }
  }

  // statiske require (literal-strenger). NB: vi skipper BYER fra vanlige banker.
  try { const core = require('@/src/banks/core'); collectFromModule(core, 'core', acc); } catch {}
  try { const flags = require('@/src/banks/flags'); collectFromModule(flags, 'flags', acc); } catch {}
  try { const bonus = require('@/src/banks/bonus'); collectFromModule(bonus, 'bonus', acc); } catch {}
  try { const extraLife = require('@/src/banks/extraLife'); collectFromModule(extraLife, 'extralife', acc); } catch {}
  try { const trick = require('@/src/banks/trick'); collectFromModule(trick, 'trick', acc); } catch {}
  try { const lightning = require('@/src/banks/lightning'); collectFromModule(lightning, 'lightning', acc); } catch {}
  // IKKE: byer – holdes utenfor (brukes av stoppesteder)

  return acc;
}

let SOURCES_CACHE: Record<string, any> | null = null;
function getSources(): Record<string, any> {
  if (!SOURCES_CACHE) SOURCES_CACHE = discoverSources();
  return SOURCES_CACHE;
}

export function getBankKeys(): string[] {
  // filtrer vekk evt. byer-keys dersom de skulle snike seg inn
  return Object.keys(getSources()).filter(k => !k.startsWith('byer:') && k !== 'byer');
}

export function loadBank(category: string, userAge?: AgeGroup): QA[] {
  if (category === 'byer' || category.startsWith('byer:')) return [];
  const p = getProfile?.();
  const age = (userAge ?? (p?.ageGroup ?? 'voksen')) as AgeGroup;
  const src = getSources()[category] ?? [];
  return normalizeBank(src, age);
}

export function pickRound(arr: QA[], n = 5): QA[] {
  const out: QA[] = [];
  const used = new Set<number>();
  const lim = Math.min(n, arr.length);
  while (out.length < lim) {
    const i = Math.floor(Math.random() * arr.length);
    if (!used.has(i)) { used.add(i); out.push(arr[i]); }
  }
  return out;
}
