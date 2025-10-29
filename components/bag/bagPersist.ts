// components/bag/bagPersist.ts
/**
 * Persist for "Mine ting" (bagStore) uten å endre bagStore.ts.
 * Hydrerer ved oppstart og lagrer ved endringer.
 */

import { bagStorageAsync } from "./bagStorage.async";
import type { BagSnapshotV1 } from "./bagStorage";
import * as bag from "./bagStore";

// Hjelpere for å hente ut lister fra BagItem[]
const listCoats = (items: ReturnType<typeof bag.getItems>) =>
  items.filter(it => it.kind === "coat").map(it => it.city);

const listHelps = (items: ReturnType<typeof bag.getItems>) =>
  items.filter(it => it.kind === "help").map(it => it.helpId);

const STORAGE_VERSION = 1 as const;
const DEFAULT_PROFILE_ID = "single"; // Bytt til ekte profileId når den er tilgjengelig

const storageKeyFor = (profileId: string) =>
  `@app/bag:v${STORAGE_VERSION}:${profileId}`;

export async function installBagPersistence(
  profileId: string = DEFAULT_PROFILE_ID
): Promise<void> {
  const key = storageKeyFor(profileId);

  // 1) HYDRER fra lagring
  try {
    const snap = await bagStorageAsync.load(key);
    if (snap) {
      const current = bag.getItems();
      const haveCoats = new Set(listCoats(current));
      for (const c of snap.coats ?? []) {
        if (!haveCoats.has(c)) bag.addCoat(c);
      }

      const haveHelps = new Set(listHelps(current));
      for (const h of snap.helps ?? []) {
        if (!haveHelps.has(h)) bag.addHelp(h);
      }
      // usedHelps: legg til senere dersom du visualiserer "gull" basert på bruk
    }
  } catch {
    // Best effort – ikke la persisteringen knekke appen
  }

  // 2) LAGRE ved endring (debounce)
  let saveTimer: ReturnType<typeof setTimeout> | null = null;
  const debouncedSave = () => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(async () => {
      const items = bag.getItems();
      const snapshot: BagSnapshotV1 = {
        version: 1,
        coats: listCoats(items),
        helps: listHelps(items),
        // usedHelps: ...
      };
      try {
        await bagStorageAsync.save(key, snapshot);
      } catch {
        // swallow
      }
    }, 120);
  };

  // lagre én gang i tilfelle hydrer ga endringer
  debouncedSave();

  // abonner på endringer i bagStore
  bag.subscribe(() => {
    debouncedSave();
  });
}

/**
 * Tøm lagret sekk for en profil (for “Start helt på nytt”).
 * Husk også å tømme runtime-state i bagStore når du faktisk resetter profilen.
 */
export async function clearBagForProfile(
  profileId: string = DEFAULT_PROFILE_ID
): Promise<void> {
  const key = storageKeyFor(profileId);
  try {
    await bagStorageAsync.clear(key);
  } catch {
    // swallow
  }
}
