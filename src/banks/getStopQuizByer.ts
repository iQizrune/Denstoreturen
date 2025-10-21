// src/banks/getStopQuizByer.ts
import { BYQUIZ_BANKS } from "./byer";
import type { StopQ } from "./stopQuizAdapter";

/** Gjør om "Mandal" → "mandal", håndterer norske tegn og rydder støy */
function toSlug(name: string): string {
  const map: Record<string, string> = {
    "æ": "ae", "ø": "o", "å": "aa",
    "é": "e",  "è": "e", "ê": "e",
    "ö": "o",  "ä": "a"
  };
  return (name || "")
    .toLowerCase()
    .replace(/[æøåéèêöä]/g, (m) => map[m] || m)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

/** Enkel shuffle for variasjon */
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Returnerer inntil `max` StopQ for gitt stopp/by, hentet fra BYQUIZ_BANKS.
 * Mapper byer.ts-formatet (med `correctId`) til StopQ-formatet (med `isCorrect` per option).
 */
export function getStopQuizByer(stopName: string, max = 6): StopQ[] {
  const slug = toSlug(stopName);
  const qs: any[] = (BYQUIZ_BANKS as any)[slug] || [];
  if (!qs.length) return [];

  const picked: any[] = qs.length > max ? shuffle(qs).slice(0, max) : qs.slice(0, max);

  return picked.map((q: any): StopQ => {
    const opts = Array.isArray(q?.options) ? q.options : [];
    const correctId = String(q?.correctId ?? "");
    return {
      id: String(q?.id ?? ""),
      text: String(q?.text ?? ""),
      options: opts.map((o: any) => ({
        id: String(o?.id ?? ""),
        label: String(o?.label ?? ""),
        isCorrect: String(o?.id ?? "") === correctId,
      })),
    };
  });
}

export default getStopQuizByer;
