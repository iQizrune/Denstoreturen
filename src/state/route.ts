// src/state/route.ts
export type Stop = { id: string; name: string; at: number };

const STOPS: Stop[] = [
  { id: 'lindesnes-fyr', name: 'Lindesnes fyr', at: 0 },
  { id: 'mandal',        name: 'Mandal',        at: 39467 },
];

let nextIndex = 1;
let stopSeen = false;

export function getStops(): Stop[] {
  return STOPS.slice();
}

export function getCurrentStop(): Stop {
  return STOPS[nextIndex] ?? STOPS[STOPS.length - 1];
}

export function getNextStopId(): string {
  return getCurrentStop().id;
}

export function getNextStopAtMeters(): number {
  return getCurrentStop().at;
}

export function getCurrentLegTargetMeters(): number {
  return getNextStopAtMeters();
}

export function isAtOrPastNextStop(totalMeters: number): boolean {
  return (Number(totalMeters) || 0) >= getNextStopAtMeters();
}

export function getMetersToNextStop(totalMeters: number): number {
  const left = getNextStopAtMeters() - (Number(totalMeters) || 0);
  return left > 0 ? left : 0;
}

export function markStopSeen(): void {
  stopSeen = true;
}

export function advanceAfterStop(): void {
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
