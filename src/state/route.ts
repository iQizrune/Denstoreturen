import { getTotalMeters } from '@/src/state/run';
import { getStops, getStopByIndex, findNextStop, type Stop } from '@/src/data/stopsIndex';

let nextIndex = 0;
let stopSeenForCurrent = false;

export function resetRoute() {
  nextIndex = 0;
  stopSeenForCurrent = false;
}

export function getRouteState() {
  const total = getTotalMeters();
  const { stop } = findNextStop(total, nextIndex);
  const nextStopAtMeters = stop ? stop.at : Number.POSITIVE_INFINITY;
  return { nextStopAtMeters, stopSeen: stopSeenForCurrent, nextIndex, stops: getStops() };
}

export function getCurrentStop(): Stop | null {
  return getStopByIndex(nextIndex);
}

export function getCurrentStopId(): string | null {
  const s = getCurrentStop(); return s ? s.id : null;
}

export function markStopSeen() {
  stopSeenForCurrent = true;
}

export function advanceAfterStop() {
  nextIndex += 1;
  stopSeenForCurrent = false;
}

export function getCurrentLegTargetMeters(): number {
  const { nextStopAtMeters } = getRouteState();
  return nextStopAtMeters;
}
