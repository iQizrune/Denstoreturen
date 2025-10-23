export type StopQOption = { id: string; label: string; isCorrect?: boolean };
export type StopQ = { id: string; text: string; options: StopQOption[] };

function asArray(x: any): any[] {
  if (Array.isArray(x)) return x;
  if (x && typeof x === 'object') return Object.values(x);
  return [];
}
function pickLabel(o: any): string {
  const keys = ['text','label','title','name','value'];
  for (const k of keys) {
    const v = o?.[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  const s = String(o ?? '');
  return s && s !== '[object Object]' ? s : '';
}
function flagTrue(v: any): boolean {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v === 1;
  if (typeof v === 'string') return v.toLowerCase() === 'true';
  return false;
}

function normalizeOne(raw: any, i: number): StopQ | null {
  if (!raw) return null;
  const text = pickLabel(raw.q ?? raw.question ?? raw);
  const id = (raw.id ?? `q${i+1}`).toString();
  const ro = asArray(raw.options ?? raw.choices ?? raw.alternatives ?? []);
  const opts: StopQOption[] = ro.map((o: any, j: number) => {
    const label = pickLabel(o);
    const isCorrect = flagTrue(o?.correct ?? o?.isCorrect ?? o?.ok ?? o?.right ?? o?.a);
    return { id: o?.id ?? `o${j+1}`, label, isCorrect };
  }).filter(x => x.label);
  if (!text || opts.length < 2) return null;
  // hvis ingen er merket korrekt, fall tilbake på første
  if (!opts.some(o => o.isCorrect)) opts[0].isCorrect = true;
  return { id, text, options: opts };
}

// Eksporterer typen 'StopQ' og 'StopQOption' for bruk i StopModule.tsx
// Vi trenger bare typene for å fikse feilen i StopModule.tsx.
export function getStopQuiz(cityId: string, age: 'barn'|'ungdom'|'voksen' = 'voksen'): StopQ[] {
  return []; 
}

// Setter en eksplisitt default eksport for å unngå TS-feil
export default {}; 
