// src/state/helpersStore.ts
// Minimal lagring av hjelpemidler + persistens. Uavhengig av eksisterende bagStore.

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { HelperKey } from "../types/helpers";
import type { HelpStatus } from "../types/helpStatus";

const STORAGE_KEY = "@app/helps/v1";

// Viktig: Partial<Record<...>> slik at nøkler kan mangle (tillat delete og "eierskap" pr nøkkel)
type HelpsMap = Partial<Record<HelperKey, HelpStatus>>;

let helps: HelpsMap = {};
let hydrated = false;

type Listener = (state: HelpsMap) => void;
const listeners = new Set<Listener>();

function notify() {
  const snapshot: HelpsMap = { ...helps };
  for (const l of listeners) l(snapshot);
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  listener({ ...helps });
  return () => {
    listeners.delete(listener);
  };
}

export function isHydrated() {
  return hydrated;
}

export function getAll(): HelpsMap {
  return { ...helps };
}

export function has(key: HelperKey): boolean {
  return helps[key] !== undefined;
}

export function getStatus(key: HelperKey): HelpStatus | undefined {
  return helps[key];
}

export async function addHelp(key: HelperKey): Promise<void> {
  if (helps[key] === undefined) {
    helps = { ...helps, [key]: "unused" };
    notify();
    await persist();
  }
}

export async function markWon(key: HelperKey): Promise<void> {
  if (helps[key] !== "won") {
    helps = { ...helps, [key]: "won" };
    notify();
    await persist();
  }
}

export async function markLost(key: HelperKey): Promise<void> {
  if (helps[key] !== "lost") {
    helps = { ...helps, [key]: "lost" };
    notify();
    await persist();
  }
}

export async function remove(key: HelperKey): Promise<void> {
  if (helps[key] !== undefined) {
    const next: HelpsMap = { ...helps };
    delete next[key]; // lovlig nå, siden key er "optional" i HelpsMap
    helps = next;
    notify();
    await persist();
  }
}

export async function clearAll(): Promise<void> {
  helps = {};
  notify();
  await persist();
}

async function persist(): Promise<void> {
  try {
    const payload = JSON.stringify(helps);
    await AsyncStorage.setItem(STORAGE_KEY, payload);
  } catch {
    // stilletiende; ikke kaste i spill-loop
  }
}

export async function hydrateHelpers(): Promise<void> {
  if (hydrated) return;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    helps = raw ? (JSON.parse(raw) as HelpsMap) : {};
  } catch {
    helps = {};
  } finally {
    hydrated = true;
    notify();
  }
}

// Selectors for UI

export function listUnused(): HelperKey[] {
  return Object.keys(helps).filter(k => helps[k as HelperKey] === "unused") as HelperKey[];
}
export function listWon(): HelperKey[] {
  return Object.keys(helps).filter(k => helps[k as HelperKey] === "won") as HelperKey[];
}
export function listLost(): HelperKey[] {
  return Object.keys(helps).filter(k => helps[k as HelperKey] === "lost") as HelperKey[];
}
