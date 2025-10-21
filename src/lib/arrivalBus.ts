// src/lib/arrivalBus.ts
export type ArrivalEvent = { index: number; id: string; meters?: number };

type Listener = (e: ArrivalEvent) => void;
const subs = new Set<Listener>();

export function publishArrival(e: ArrivalEvent) {
  subs.forEach(fn => { try { fn(e); } catch {} });
}
export function onArrival(fn: Listener) {
  subs.add(fn);
  return () => { subs.delete(fn); }; // ✅ returnerer void
}

