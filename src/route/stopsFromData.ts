// src/route/stopsFromData.ts
// Samler stopp fra dagens kilder uten routeGlobals:
// - assets/route/route-legs.json (koordinater i leggers endepunkter)
// - src/data/stops.ts (rekkefølge + kumulative meter)

import type { RouteLeg, RoutePoint } from "@/src/types/route";
import { STOP_NAMES, STOP_CUM_METERS } from "@/src/data/stops";

export type Stop = {
  id: string;       // slug/id, f.eks. "oslo"
  name: string;     // visningsnavn
  lat: number;
  lng: number;
  index: number;    // 0..N-1 i STOP_NAMES
  at?: number;      // kumulativ meter fra STOP_CUM_METERS
};

/**
 * Hent et punkt [lat,lng] fra en leggs start/slutt.
 */
function firstPoint(leg: RouteLeg | undefined): RoutePoint | null {
  if (!leg || !Array.isArray(leg.path) || leg.path.length === 0) return null;
  return leg.path[0]!;
}
function lastPoint(leg: RouteLeg | undefined): RoutePoint | null {
  if (!leg || !Array.isArray(leg.path) || leg.path.length === 0) return null;
  return leg.path[leg.path.length - 1]!;
}

/**
 * Bygger stopp-listen slik:
 *  - stop[0]   = første punkt i legs[0]
 *  - stop[i>0] = siste punkt i legs[i-1]
 *  (dette matcher a→b, b→c, c→d …-modellen)
 */
export function getOrderedStops(legs: RouteLeg[]): Stop[] {
  const names = STOP_NAMES.slice();
  const N = names.length;

  const out: Stop[] = [];

  for (let i = 0; i < N; i++) {
    let lat = 0, lng = 0;

    if (i === 0) {
      const p = firstPoint(legs[0]);
      if (p) { lat = p[0]; lng = p[1]; }
    } else {
      const p = lastPoint(legs[i - 1]);
      if (p) { lat = p[0]; lng = p[1]; }
      else {
        // fallback: hvis legs[i-1] ikke finnes, bruk siste punkt i siste legg
        const p2 = lastPoint(legs[legs.length - 1]);
        if (p2) { lat = p2[0]; lng = p2[1]; }
      }
    }

    out.push({
      id: String(names[i]).toLowerCase(),
      name: names[i],
      lat, lng,
      index: i,
      at: STOP_CUM_METERS[i] ?? undefined,
    });
  }

  return out;
}

/**
 * Finn "gjeldende stopp-indeks" gitt total meter.
 * Returnerer største i der STOP_CUM_METERS[i] <= meters.
 */
export function indexFromMeters(meters: number): number {
  if (!Number.isFinite(meters) || meters < 0) return 0;
  for (let i = STOP_CUM_METERS.length - 1; i >= 0; i--) {
    if (meters >= (STOP_CUM_METERS[i] || 0)) return i;
  }
  return 0;
}
