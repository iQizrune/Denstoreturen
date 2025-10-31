// src/engine/triggers/helperPickup.ts
// Enkel trigger som sjekker HELPER_SPAWNS mot totalMeters og viser plakat én gang.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { HELPER_SPAWNS, type HelperSpawn } from "../../data/helper_spawns";
import type { HelperKey } from "../../types/helpers";


const SEEN_KEY = "@app/helps/spawns-seen/v1";

type SeenMap = Partial<Record<HelperKey, true>>;
let seen: SeenMap | null = null;

async function loadSeen(): Promise<SeenMap> {
  if (seen) return seen;
  try {
    const raw = await AsyncStorage.getItem(SEEN_KEY);
    seen = raw ? (JSON.parse(raw) as SeenMap) : {};
  } catch {
    seen = {};
  }
  return seen!;
}
async function markSeen(key: HelperKey) {
  const s = await loadSeen();
  if (!s[key]) {
    s[key] = true;
    try {
      await AsyncStorage.setItem(SEEN_KEY, JSON.stringify(s));
    } catch {}
  }
}

/**
 * Sjekk og evt. presenter plakat for et hjelpemiddel som skal dukke opp ved/etter totalMeters.
 * present(fn) skal vise en plakat med helperKey; den MÅ ikke legge i sekken – det gjør bruker via plakat-knapp.
 */
export async function maybeTriggerHelperPickup(
  totalMeters: number,
  present: (helperKey: HelperKey) => void
): Promise<void> {
  const s = await loadSeen();

  // Finn første spawn som er passert og ikke vist tidligere
  const spawn = HELPER_SPAWNS.find((sp: HelperSpawn) => totalMeters >= sp.meters && !s[sp.helper]);

  if (!spawn) return;

  present(spawn.helper);
  await markSeen(spawn.helper);
}

// for testing/debug reset
export async function __resetHelperSpawnsSeen() {
  seen = {};
  try { await AsyncStorage.removeItem(SEEN_KEY); } catch {}
}
