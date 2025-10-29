import { statsStorageAsync } from "./statsStorage.async";
import type { StatsSnapshotV1 } from "./statsTypes";
import * as stats from "./statsStore";

const STORAGE_VERSION = 1 as const;
const DEFAULT_PROFILE_ID = "single"; // bytt til faktisk profileId når du har det

const storageKeyFor = (profileId: string) =>
  `@app/stats:v${STORAGE_VERSION}:${profileId}`;

export async function installStatsPersistence(profileId: string = DEFAULT_PROFILE_ID) {
  const key = storageKeyFor(profileId);

  // 1) load
  try {
    const snap = await statsStorageAsync.load(key);
    if (snap) stats.hydrateFromSnapshot(snap);
  } catch {}

  // 2) save on change (lett debounce)
  let t: ReturnType<typeof setTimeout> | null = null;
  const debouncedSave = () => {
    if (t) clearTimeout(t);
    t = setTimeout(async () => {
      const snapshot: StatsSnapshotV1 = { ...stats.getSnapshot() };
      try { await statsStorageAsync.save(key, snapshot); } catch {}
    }, 150);
  };

  // første lagring etter mulig hydrer-endring
  debouncedSave();

  // abonnér
  return stats.subscribe(debouncedSave);
}

export async function clearStatsForProfile(profileId: string = DEFAULT_PROFILE_ID) {
  const key = storageKeyFor(profileId);
  try { await statsStorageAsync.clear(key); } catch {}
}
