// src/banks/sequence.ts
// Robust normalisering + enkel sekvensmotor for flervalgs-quiz.
// - Støtter både `correct` og `isCorrect` på alternativer
// - Støtter `correctId` på spørsmål (overstyrer alternativ-flagg om satt)
// - Tåler ulike feltnavn: { text|question|prompt }, { label|text|name }, { id|key|value }
// - Stabil shuffling per spørsmål (kan slås av)
// - Én riktig per spørsmål (detekteres trygt)

export type RawOption = any;
export type RawQuestion = any;

// Normalisert alternativ
export type Option = {
  id: string;
  label: string;
  correct: boolean;
};

// Normalisert spørsmål
export type ManagedQuestion = {
  id: string;
  text: string;
  options: Option[];   // n >= 2
  correctId: string;   // alltid satt til id for riktig opsjon
  meta?: Record<string, unknown>;
};

// Konfig for normalisering/sekvens
export type SequenceConfig = {
  shuffleOptions?: boolean;   // default: true
  seed?: string | number;     // valgfri; stabiliserer shuffling
};

// Resultat av besvarelse
export type AnswerResult = {
  questionId: string;
  chosenId: string;
  correctId: string;
  correct: boolean;
};

// -------------------------
// Utils
// -------------------------

function str(x: any, fallback = ""): string {
  if (typeof x === "string") return x;
  if (x == null) return fallback;
  try { return String(x); } catch { return fallback; }
}

function bool(x: any): boolean {
  return x === true || x === "true" || x === 1 || x === "1";
}

function num(x: any, fallback = 0): number {
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}

function coalesce<T>(...vals: T[]): T {
  for (const v of vals) {
    if (v !== undefined && v !== null && v !== "") return v;
  }
  // @ts-ignore
  return undefined;
}

function makeId(parts: any[], def = ""): string {
  const s = parts.map(p => (p == null ? "" : String(p))).filter(Boolean).join("_");
  return s || def || Math.random().toString(36).slice(2);
}

// -------------------------
// Seedet shuffling (Fisher-Yates)
// -------------------------

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function() {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], seed?: string | number): T[] {
  const out = arr.slice();
  if (seed === undefined) {
    // Ikke-seedet: vanlig Fisher-Yates med Math.random
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }
  const s = typeof seed === "string"
    ? Array.from(seed).reduce((a,c)=>a + c.charCodeAt(0), 0)
    : num(seed, 0);
  const rnd = mulberry32(s || 123456);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// -------------------------
// Normalisering
// -------------------------

export function normalizeOption(raw: RawOption): Option {
  const id = str(coalesce(raw?.id, raw?.value, raw?.key, raw?.label, raw?.text), "").trim() || makeId([raw?.id, raw?.value, raw?.key]);
  const label = str(coalesce(raw?.label, raw?.text, raw?.name, raw?.title, raw?.value, raw?.id), "").trim();
  // Støtt både `correct` og `isCorrect`
  const correct = bool(coalesce(raw?.correct, raw?.isCorrect, false));
  return { id, label, correct };
}

export function normalizeQuestion(raw: RawQuestion, cfg: SequenceConfig = {}): ManagedQuestion {
  // spm-id + tekst
  const id = str(coalesce(raw?.id, raw?.key, raw?.slug), "").trim() || makeId([raw?.id, raw?.key, raw?.slug], "q");
  const text = str(coalesce(raw?.text, raw?.question, raw?.prompt, raw?.title), "").trim();

  // alternativer (må finnes)
  const optsRaw = Array.isArray(raw?.options) ? raw.options
                 : Array.isArray(raw?.answers) ? raw.answers
                 : Array.isArray(raw?.choices) ? raw.choices
                 : [];
  const options0 = optsRaw.map(normalizeOption);

  // Dersom spørsmål har `correctId`, overstyr flagg på alternativer
  const explicitCorrectId = str(raw?.correctId || "", "").trim();
  let options = options0;
  let correctId = "";

  if (explicitCorrectId) {
    options = options0.map((o: Option, i: number) => ({ ...o, correct: i === 0 }));
    correctId = explicitCorrectId;
  } else {
    const winner = options0.find((o: Option) => o.correct);
    correctId = winner?.id || "";
  }

  // Som siste utvei: hvis fortsatt ingen correctId, plukk første (bedre enn tom streng; UI trenger alltid en fasit)
  if (!correctId && options0.length > 0) {
    correctId = options0[0].id;
    options = options0.map((o: Option) => ({ ...o, correct: o.id === explicitCorrectId }));

  }

  // Shuffling (default: true). Når vi shuffler, flytter vi ALLE alternativer – `correctId` funker da fordi vi matcher på id.
  const shuffleOptions = cfg.shuffleOptions ?? true;
  const seed = cfg.seed ?? id; // standard: stabil per spørsmål-id
  const finalOptions = shuffleOptions ? seededShuffle(options, seed) : options;

  return {
    id,
    text,
    options: finalOptions,
    correctId,
    meta: typeof raw?.meta === "object" && raw?.meta ? raw.meta : undefined,
  };
}

export function normalizeBank(bank: RawQuestion[] | Record<string, any>, cfg: SequenceConfig = {}): ManagedQuestion[] {
  if (Array.isArray(bank)) {
    return bank.map(q => normalizeQuestion(q, cfg));
  }
  // Hvis det er et objekt med .questions e.l.
  const arr = Array.isArray((bank as any)?.questions) ? (bank as any).questions
           : Array.isArray((bank as any)?.items) ? (bank as any).items
           : [];
  return arr.map((q: any) => normalizeQuestion(q, cfg));
}

// -------------------------
// Evaluering
// -------------------------

export function evaluateAnswer(q: ManagedQuestion, chosenId: string): AnswerResult {
  const correctId = q.correctId;
  const correct = chosenId === correctId;
  return { questionId: q.id, chosenId, correctId, correct };
}

// -------------------------
// Sekvensmotor
// -------------------------

export class Sequence {
  private qs: ManagedQuestion[];
  private i = 0;
  private answers = new Map<string, AnswerResult>();

  constructor(questions: ManagedQuestion[]) {
    this.qs = questions.slice();
  }

  static fromRaw(raw: RawQuestion[] | Record<string, any>, cfg: SequenceConfig = {}): Sequence {
    return new Sequence(normalizeBank(raw, cfg));
  }

  get length() { return this.qs.length; }
  get index() { return this.i; }
  get finished() { return this.i >= this.qs.length; }

  current(): ManagedQuestion | null {
    if (this.finished) return null;
    return this.qs[this.i];
    }

  /** Registrer svar for nåværende spørsmål. Returnerer resultatet. */
  answer(chosenId: string): AnswerResult | null {
    const q = this.current();
    if (!q) return null;
    const res = evaluateAnswer(q, chosenId);
    this.answers.set(q.id, res);
    return res;
  }

  /** Gå til neste spørsmål. Returnerer true hvis vi har flere. */
  next(): boolean {
    if (this.i < this.qs.length) this.i++;
    return !this.finished;
  }

  /** Gå ett tilbake (hvis du vil støtte det). */
  prev(): boolean {
    if (this.i > 0) this.i--;
    return true;
  }

  /** Summer poeng: 1 per riktig. */
  score(): number {
    let s = 0;
    for (const [, res] of this.answers) if (res.correct) s++;
    return s;
  }

  /** Antall besvarte. */
  answered(): number {
    return this.answers.size;
  }

  /** Hent resultat for et gitt spørsmål-id. */
  getAnswer(qid: string): AnswerResult | undefined {
    return this.answers.get(qid);
  }

  /** Nullstill sekvensen (beholder spørsmål). */
  reset() {
    this.i = 0;
    this.answers.clear();
  }

  toJSON() {
    return {
      index: this.i,
      length: this.qs.length,
      finished: this.finished,
      answers: Array.from(this.answers.values()),
    };
  }
}

// -------------------------
// Hjelper-API (for enkel bruk i UI)
// -------------------------

export type ManagedBank = {
  questions: ManagedQuestion[];
  currentIndex: number;
  finished: boolean;
  score: number;
};

export function buildManagedBank(raw: RawQuestion[] | Record<string, any>, cfg: SequenceConfig = {}): ManagedBank {
  const seq = Sequence.fromRaw(raw, cfg);
  return {
    questions: (seq as any).qs ?? normalizeBank(raw, cfg), // fallback om privat
    currentIndex: seq.index,
    finished: seq.finished,
    score: 0,
  };
}
