// components/bag/statsStore.ts
import type { StatsSnapshotV1 } from "./statsTypes";

type Listener = () => void;

type StatsState = {
  softRestarts: number;
  totalPlaySeconds: number; // effektiv spilletid (sekunder)
  totalAnswered: number;    // uten byquiz
  totalCorrect: number;     // uten byquiz
  totalWrong: number;       // uten byquiz
  _sessionStartedAt: number | null; // intern session-tracker
};

const state: StatsState = {
  softRestarts: 0,
  totalPlaySeconds: 0,
  totalAnswered: 0,
  totalCorrect: 0,
  totalWrong: 0,
  _sessionStartedAt: null,
};

// -------- CACHED SNAPSHOT (stabil referanse for useSyncExternalStore) --------
let cached: StatsSnapshotV1 = {
  version: 1,
  softRestarts: 0,
  totalPlaySeconds: 0,
  totalAnswered: 0,
  totalCorrect: 0,
  totalWrong: 0,
  updatedAt: Date.now(),
};

function rebuildSnapshot() {
  cached = {
    version: 1,
    softRestarts: state.softRestarts,
    totalPlaySeconds: state.totalPlaySeconds,
    totalAnswered: state.totalAnswered,
    totalCorrect: state.totalCorrect,
    totalWrong: state.totalWrong,
    updatedAt: Date.now(),
  };
}

const listeners = new Set<Listener>();

function notify() {
  rebuildSnapshot(); // Viktig: oppdater cache kun her, ikke i getSnapshot()
  listeners.forEach((fn) => {
    try {
      fn();
    } catch {
      // ignore listener errors
    }
  });
}

// ------------- Public API (brukes av UI/persist) ----------------------------

export function subscribe(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getSnapshot(): StatsSnapshotV1 {
  // Må returnere samme objekt mellom notify() for å unngå uendelig render-loop
  return cached;
}

// HYDRERING (fra persist)
export function hydrateFromSnapshot(s: StatsSnapshotV1) {
  const hadRunningSession = state._sessionStartedAt != null;

  state.softRestarts     = s?.softRestarts ?? 0;
  state.totalPlaySeconds = s?.totalPlaySeconds ?? 0;
  state.totalAnswered    = s?.totalAnswered ?? 0;
  state.totalCorrect     = s?.totalCorrect ?? 0;
  state.totalWrong       = s?.totalWrong ?? 0;

  // Viktig: ikke null ut en pågående økt som allerede er startet før hydrering fullførte
  if (!hadRunningSession) {
    state._sessionStartedAt = null;
  }

  // Oppdater cache og varsle lyttere
  notify();

  // Debug (valgfritt, men nyttig kortsiktig)
}


// MUTASJONER

export function incSoftRestart() {
  state.softRestarts += 1;
  notify();
}

export function startSession(nowMs: number = Date.now()) {
  if (state._sessionStartedAt == null) {
    state._sessionStartedAt = nowMs;
    // DEBUG
    // (valgfritt) notify();  // la stå kommentert – vi trenger ikke re-render på start
  }
}


export function stopSession(nowMs: number = Date.now()) {
  if (state._sessionStartedAt != null) {
    const delta = Math.max(0, Math.floor((nowMs - state._sessionStartedAt) / 1000));
    state.totalPlaySeconds += delta;
    // DEBUG
    state._sessionStartedAt = null;
    notify();
  }
}


// Antall spørsmål (ikke byquiz)
export function recordAnswer(correct: boolean) {
  state.totalAnswered += 1;
  if (correct) state.totalCorrect += 1;
  else state.totalWrong += 1;
  notify();
}

// Til nøds-rydding (brukes ved hard reset sammen med clearStatsForProfile)
export function clearRuntime() {
  state.softRestarts = 0;
  state.totalPlaySeconds = 0;
  state.totalAnswered = 0;
  state.totalCorrect = 0;
  state.totalWrong = 0;
  state._sessionStartedAt = null;
  notify();
}
// Live-verdien inkludert pågående økt (endrer ikke state og trigger ikke notify)
export function getLivePlaySeconds(nowMs: number = Date.now()): number {
  const base = cached.totalPlaySeconds;
  const active = state._sessionStartedAt != null;
  const since = active ? Math.floor((nowMs - (state._sessionStartedAt as number)) / 1000) : 0;
  const total = active ? base + Math.max(0, since) : base;
  return total;
}




