// src/banks/flagsAdapter.ts
// Bygger "Hvilket flagg er dette?"-spørsmål.
// 1) Prøver å lese fra src/banks/flags.ts (tolerant på format/feltnavn).
// 2) FALLBACK: hvis ingen gyldige elementer -> bygg fra FLAGS_ASSETS (filene i assets/flags).

import { FLAGS_ASSETS } from "@/src/banks/flagsAssets";
import { ManagedQuestion, normalizeBank } from "@/src/banks/sequence";

/* ---------------- utils ---------------- */

function str(x: any): string {
  if (typeof x === "string") return x;
  if (x == null) return "";
  try { return String(x); } catch { return ""; }
}

// Ekstraher "kode" (brukes som id + oppslag i FLAGS_ASSETS)
function keyFrom(item: any): string {
  const raw =
    item?.code ?? item?.id ?? item?.key ??
    item?.alpha2 ?? item?.alpha_2 ?? item?.cca2 ?? item?.cca_2 ??
    item?.img ?? item?.image ?? item?.file ?? item?.slug;
  const s = str(raw).toLowerCase();
  return s.replace(/\.[a-z0-9]+$/i, "").replace(/@.*$/, "");
}

// Ekstraher visningsnavn
function nameFrom(item: any): string {
  const raw =
    item?.name ?? item?.label ?? item?.title ?? item?.text ?? item?.country ??
    item?.commonName ?? item?.officialName ?? item?.display ?? item?.full;
  return str(raw).trim();
}

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pickN<T>(arr: T[], n: number, avoidIndex: number): T[] {
  const idxs = arr.map((_, i) => i).filter((i) => i !== avoidIndex);
  const sh = shuffle(idxs);
  const take = sh.slice(0, n);
  return take.map((i) => arr[i]);
}

/* ---------------- forsøk å lese flags.ts ---------------- */

function loadRawFlagsModule(): any[] {
  let mod: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    mod = require("@/src/banks/flags");
  } catch {
    mod = null;
  }
  if (!mod) return [];

  const m = mod.default ?? mod;

  if (Array.isArray(m)) return m;

  const arr =
    (Array.isArray(m?.questions) && m.questions) ||
    (Array.isArray(m?.items)     && m.items)     ||
    (Array.isArray(m?.list)      && m.list)      ||
    (Array.isArray(m?.FLAGS)     && m.FLAGS)     ||
    (Array.isArray(m?.flags)     && m.flags)     ||
    (Array.isArray(m?.data)      && m.data)      ||
    [];

  return Array.isArray(arr) ? arr : [];
}

/* ---------------- bygg rå-spørsmål fra flags.ts ---------------- */

function buildRawFromModule(): any[] {
  const raw = loadRawFlagsModule();

  const items = raw
    .map((it: any) => ({ key: keyFrom(it), name: nameFrom(it) }))
    .filter((it) => it.key && it.name);

  console.log("[flagsAdapter] items from module:", items.length);

  if (items.length < 4) return [];

  const qs: any[] = [];

  items.forEach((it, idx) => {
    const correctKey = it.key;
    const correctName = it.name;

    const distractors = pickN(items, 3, idx);
    const options = shuffle([
      { id: correctKey, label: correctName, isCorrect: true },
      ...distractors.map((d) => ({ id: d.key, label: d.name, isCorrect: false })),
    ]);

    const img = FLAGS_ASSETS[correctKey] ?? null;

    qs.push({
      id: `flag_${correctKey}`,
      text: "Hvilket flagg er dette?",
      options,
      correctId: correctKey,
      image: img,
      meta: { kind: "flags", code: correctKey },
    });
  });

  return qs;
}

/* ---------------- FALLBACK fra assets ---------------- */

// Enkel “display name” fallback fra kode → penere navn.
// Utvid gjerne denne etter behov (eksakt mapping hvis du vil).
function prettyFromCode(code: string): string {
  const c = code.toUpperCase();
  // Kjappe spesialtilfeller:
  if (c === "NO") return "Norge";
  if (c === "SE") return "Sverige";
  if (c === "DK") return "Danmark";
  if (c === "FI") return "Finland";
  if (c === "IS") return "Island";
  // Default: “NO” → “No”
  return c.charAt(0) + c.slice(1).toLowerCase();
}

function buildRawFromAssets(): any[] {
  const entries = Object.keys(FLAGS_ASSETS)
    .map((k) => ({ key: k.toLowerCase(), img: FLAGS_ASSETS[k], name: prettyFromCode(k) }))
    .filter((it) => it.key && it.img);

  console.log("[flagsAdapter] items from assets:", entries.length);

  if (entries.length < 4) return [];

  const qs: any[] = [];

  entries.forEach((it, idx) => {
    const correctKey = it.key;
    const correctName = it.name;

    // Trekk 3 distraktorer blant alle entries
    const distractors = pickN(entries, 3, idx);
    const options = shuffle([
      { id: correctKey, label: correctName, isCorrect: true },
      ...distractors.map((d) => ({ id: d.key, label: d.name, isCorrect: false })),
    ]);

    qs.push({
      id: `flag_${correctKey}`,
      text: "Hvilket flagg er dette?",
      options,
      correctId: correctKey,
      image: it.img,
      meta: { kind: "flags", code: correctKey },
    });
  });

  return qs;
}

/* ---------------- offentlig API ---------------- */

export function buildFlagsQuestions(): ManagedQuestion[] {
  // 1) Prøv modul
  let raws = buildRawFromModule();

  // 2) Fallback til assets-mapping
  if (!raws.length) {
    raws = buildRawFromAssets();
  }

  if (!raws.length) return [];
  return normalizeBank(raws, { shuffleOptions: true, seed: "flags" });
}
