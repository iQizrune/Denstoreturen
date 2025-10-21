// src/banks/buildQuizPool.ts
// Metro-vennlig, statiske ES-importer. Tagger meta.kind for meterlogikk i UI.
// Bevarer local/byer ute (tas i StopModule senere).

import { ManagedQuestion, normalizeBank } from "@/src/banks/sequence";

// Bank-eksporter (som i repoet ditt):
import { easyBank, mediumBank, hardBank, impossibleBank } from "@/src/banks/core";
import { bonusEasyBank, bonusMediumBank, bonusHardBank } from "@/src/banks/bonus";
import { trickBank } from "@/src/banks/trick";
import { revealEasy, revealMedium, revealHard } from "@/src/banks/reveal";
import { LIGHTNING_BANKS } from "@/src/banks/lightning";
import { extraLifeBank } from "@/src/banks/extraLife";
import { buildFlagsQuestions } from "@/src/banks/flagsAdapter";

export type ProviderId =
  | "core"
  | "flags"
  | "trick"
  | "bonus"
  | "reveal"
  | "lightning"
  | "extralife";

export type BuildConfig = {
  enabled?: Partial<Record<ProviderId, boolean>>;
  weights?: Partial<Record<ProviderId, number>>;
  maxTotal?: number;
  seed?: string;
  shuffleOptions?: boolean;
};

const DEFAULT_ENABLED: Record<ProviderId, boolean> = {
  core: true,
  flags: true,
  trick: false,
  bonus: false,
  reveal: false,
  lightning: false,
  extralife: false,
};

const DEFAULT_WEIGHTS: Record<ProviderId, number> = {
  core: 3,
  flags: 2,
  trick: 1,
  bonus: 1,
  reveal: 1,
  lightning: 1,
  extralife: 1,
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
function pick<T>(arr: T[], count: number): T[] {
  const out: T[] = [];
  const a = arr.slice();
  const n = clamp(count | 0, 0, a.length);
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * a.length);
    out.push(a.splice(idx, 1)[0]);
  }
  return out;
}
function weightedAdd(target: ManagedQuestion[], src: ManagedQuestion[], w: number) {
  const k = Math.max(0, w | 0);
  for (let i = 0; i < k; i++) target.push(...src);
  return target;
}
function weightOf(weights: BuildConfig["weights"], id: ProviderId, def: number): number {
  const w = (weights && typeof weights[id] === "number") ? (weights[id] as number) : def;
  return Math.max(0, w | 0);
}
function truth(v: any, fallback: boolean) {
  if (typeof v === "boolean") return v;
  if (v == null) return fallback;
  return !!v;
}

// ----- Loader per kategori (statiske importer + meta.kind tagging) -----

function loadCore(): ManagedQuestion[] {
  const raw = [...easyBank, ...mediumBank, ...hardBank, ...impossibleBank].map((q: any) => ({
    ...q, meta: { ...(q.meta || {}), kind: "core" },
  }));
  return normalizeBank(raw, { shuffleOptions: true, seed: "core" });
}

function loadFlags(): ManagedQuestion[] {
  // buildFlagsQuestions() returnerer allerede normaliserte ManagedQuestion.
  // Legg på kind i etterkant for meterlogikk i UI.
  return buildFlagsQuestions().map((q: any) => ({
    ...q, meta: { ...(q.meta || {}), kind: "flags" },
  }));
}

function loadTrick(): ManagedQuestion[] {
  const raw = trickBank.map((q: any) => ({ ...q, meta: { ...(q.meta || {}), kind: "trick" } }));
  return normalizeBank(raw, { shuffleOptions: true, seed: "trick" });
}

function loadBonus(): ManagedQuestion[] {
  const raw = [...bonusEasyBank, ...bonusMediumBank, ...bonusHardBank].map((q: any) => ({
    ...q, meta: { ...(q.meta || {}), kind: "bonus" },
  }));
  return normalizeBank(raw, { shuffleOptions: true, seed: "bonus" });
}

function loadReveal(): ManagedQuestion[] {
  // Bær 'avdekking' inn i meta slik at den overlever normalisering (brukes i UI for bildeoppslag)
  const raw = [...revealEasy, ...revealMedium, ...revealHard].map((q: any) => ({
    ...q,
    meta: { ...(q.meta || {}), kind: "reveal", avdekking: q.avdekking },
  }));
  return normalizeBank(raw, { shuffleOptions: true, seed: "reveal" });
}

function loadLightning(): ManagedQuestion[] {
  const raw = Object.values(LIGHTNING_BANKS).flat().map((q: any) => ({
    ...q, meta: { ...(q.meta || {}), kind: "lightning" },
  }));
  return normalizeBank(raw, { shuffleOptions: true, seed: "lightning" });
}

function loadExtralife(): ManagedQuestion[] {
  const raw = extraLifeBank.map((q: any) => ({ ...q, meta: { ...(q.meta || {}), kind: "extralife" } }));
  return normalizeBank(raw, { shuffleOptions: true, seed: "extralife" });
}

function loadProvider(id: ProviderId): ManagedQuestion[] {
  switch (id) {
    case "core": return loadCore();
    case "flags": return loadFlags();
    case "trick": return loadTrick();
    case "bonus": return loadBonus();
    case "reveal": return loadReveal();
    case "lightning": return loadLightning();
    case "extralife": return loadExtralife();
    default: return [];
  }
}

// -------------------------
// Hovedbygger
// -------------------------

export function buildQuizPool(config: BuildConfig = {}): ManagedQuestion[] {
  const enabled: Record<ProviderId, boolean> = { ...DEFAULT_ENABLED, ...(config.enabled || {}) };
  const weights = config.weights || {};
  const ids = Object.keys(enabled) as ProviderId[];

  let pool: ManagedQuestion[] = [];

  // 1) Last banker
  const bankMap: Partial<Record<ProviderId, ManagedQuestion[]>> = {};
  for (const id of ids) {
    if (!truth(enabled[id], DEFAULT_ENABLED[id])) continue;
    const arr = loadProvider(id);
    if (arr && arr.length) bankMap[id] = arr;
  }

  // 2) Vektkopier
  for (const id of ids) {
    if (!bankMap[id]) continue;
    const w = weightOf(weights, id, DEFAULT_WEIGHTS[id]);
    if (w <= 0) continue;
    weightedAdd(pool, bankMap[id]!, w);
  }

  // 3) Kapp total hvis ønsket
  const max = Number(config.maxTotal || 0);
  if (max > 0 && pool.length > max) {
    pool = pick(pool, max);
  }

  return pool;
}
