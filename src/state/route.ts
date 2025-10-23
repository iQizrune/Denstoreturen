// src/state/route.ts - Kjerne-state for rute-progresjon (bruker korrekt rutedata)
import { STOP_NAMES, STOP_CUM_METERS } from "@/src/data/stops";

export type Stop = { id: string; name: string; at: number };

// Setter opp STOPS ved å mappe navn og kumulative meter
// Navn konverteres fra slug-format (f.eks. lindesnes-fyr -> Lindesnes Fyr)
const STOPS: Stop[] = STOP_NAMES.map((name, index) => ({
  id: name,
  name: name.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
  at: STOP_CUM_METERS[index] || 0,
}));

// Starter ved første stopp (Lindesnes Fyr, index 0). Neste mål er Mandal (index 1).
let nextIndex = 1; 
let stopSeen = false;

export function getStops(): Stop[] {
  return STOPS;
}

export function getCurrentStop(): Stop {
  // Gir oss mål-stoppet for den gjeldende etappen (første gang: Mandal)
  return STOPS[nextIndex] ?? STOPS[STOPS.length - 1];
}

export function getNextStopAtMeters(): number {
  return getCurrentStop().at;
}

export function getMetersToNextStop(totalMeters: number): number {
  const left = getNextStopAtMeters() - (Number(totalMeters) || 0);
  return Math.max(0, left);
}

export function markStopSeen(): void {
  stopSeen = true;
}

export function advanceAfterStop(): void {
  // Oppdaterer til neste stopp i køen
  stopSeen = false;
  if (nextIndex < STOPS.length - 1) nextIndex += 1;
}

export function getRouteState(): {
  nextStopAtMeters: number;
  stopSeen: boolean;
  nextIndex: number;
  stops: Stop[];
} {
  return {
    nextStopAtMeters: getNextStopAtMeters(),
    stopSeen,
    nextIndex,
    stops: getStops(),
  };
}
