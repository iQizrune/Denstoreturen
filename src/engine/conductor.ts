import { getTotalMeters } from '@/src/state/run';
import { getRouteState } from '@/src/state/route';

type Phase = 'route' | 'stop';
let phase: Phase = 'route';

export function getPhase(): Phase { return phase; }
export function isStopActive(): boolean { return phase === 'stop'; }
export function enterStop() { phase = 'stop'; }
export function exitStop() { phase = 'route'; }

export function getNextPhaseAfterResults(): Phase {
  const total = getTotalMeters();
  const { nextStopAtMeters, stopSeen } = getRouteState();
  if (!stopSeen && total >= nextStopAtMeters) { phase = 'stop'; return 'stop'; }
  phase = 'route';
  return 'route';
}
