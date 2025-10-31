// src/data/helper_spawns.ts
// Definer hvor langs ruta et hjelpemiddel plukkes opp.
// Inntil vi setter faktiske punkter, lar vi lista være tom for å unngå typefeil.

import type { HelperKey } from "../types/helpers";

export type HelperSpawn = {
  meters: number;     // ved passering av denne terskelen trigges plakat
  helper: HelperKey;  // hvilken nøkkel som tildeles
  once?: boolean;     // default true
};

export const HELPER_SPAWNS: HelperSpawn[] = [
    { meters: 200, helper: "sanden" as HelperKey }, // Mandal (Sjøsanden)
  // Fylles inn senere: { meters: 12345, helper: "din-nokkel", once: true },
];

// Hjelpefunksjon: finn første spawn over en gitt meterverdi
export function findNextHelperSpawnAfter(totalMeters: number): HelperSpawn | undefined {
  return HELPER_SPAWNS.find(s => totalMeters < s.meters);
}
