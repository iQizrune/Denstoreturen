// src/lib/stageQueue.ts
export type StageStartPayload = {
  fromName: string;
  toName?: string;
  meters?: number;
};

let pending: StageStartPayload | null = null;

export function queueStageStart(payload: StageStartPayload) {
  // Skriv over ev. gammel pending – vi vil bare ha én om gangen
  pending = payload;
  if (__DEV__) {
    try { console.log("[stageQueue] queued", payload); } catch {}
  }
}

export function takePendingStageStart(): StageStartPayload | null {
  const p = pending;
  pending = null;
  if (p && __DEV__) {
    try { console.log("[stageQueue] taken", p); } catch {}
  }
  return p;
}
