// src/lib/stageBus.ts
// Lett event-bus for kommunikasjon mellom StopModule og PlayScreen
type StageStartPayload = {
  fromName: string;
  toName: string;
  meters: number;
};

// Intern enkel subscriber-liste
const listeners = new Set<(p: StageStartPayload) => void>();

export function publishStageStart(payload: StageStartPayload) {
  console.log("[stageBus] publishStageStart", payload);
  listeners.forEach((fn) => {
    try {
      fn(payload);
    } catch (e) {
      console.warn("[stageBus] listener error", e);
    }
  });
}

export function subscribeStageStart(
  fn: (p: StageStartPayload) => void
): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn); // ✅ unsubscribe-funksjon
}
