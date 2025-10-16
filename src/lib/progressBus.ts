// src/lib/progressBus.ts
export type Payload = { meters: number; ts?: number };
type Listener = (d: Payload) => void;

const subs = new Set<Listener>();
let lastMeters = 0;

export function publishMeters(meters: number) {
  if (Number.isFinite(meters)) {
    lastMeters = meters;
    const d = { meters, ts: Date.now() };
    subs.forEach((fn) => fn(d));
  }
}

export function subscribeMeters(fn: Listener) {
  subs.add(fn);
  return () => { subs.delete(fn); };
}

export const onMeters = subscribeMeters;

export function getMetersSnapshot(): number {
  return Number.isFinite(lastMeters) ? lastMeters : 0;
}
