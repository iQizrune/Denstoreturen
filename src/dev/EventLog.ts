type EventType =
  | "phase-change"
  | "stop/mount"
  | "stop/unmount"
  | "stop/answer"
  | "meter/change"
  | "debug";
let enabled = true;
let seq = 0;
export function setEventLogEnabled(value: boolean) { enabled = value; }
export function logEvent(type: EventType | string, payload?: unknown) {
  if (!enabled) return;
  const ts = new Date().toISOString();
  const id = ++seq;
  try {
    const base = { t: ts, seq: id, type: String(type) };
    const data = payload == null ? base : { ...base, payload: sanitize(payload, 2, 800) };
    console.log("[eventlog] " + JSON.stringify(data));
  } catch {
    console.log("[eventlog] " + JSON.stringify({ t: ts, seq: id, type: String(type), note: "payload_unserializable" }));
  }
}
function sanitize(input: any, depth: number, maxLen: number): any {
  if (depth <= 0) return "[depth]";
  if (input == null) return input;
  const t = typeof input;
  if (t === "string") return input.length > maxLen ? input.slice(0, maxLen) + "…[trim]" : input;
  if (t === "number" || t === "boolean") return input;
  if (Array.isArray(input)) return input.slice(0, 20).map((x) => sanitize(x, depth - 1, maxLen));
  if (t === "object") {
    const out: Record<string, unknown> = {};
    const keys = Object.keys(input).slice(0, 20);
    for (const k of keys) out[k] = sanitize((input as any)[k], depth - 1, maxLen);
    return out;
  }
  return String(input);
}
export const EventLog = { enable: () => setEventLogEnabled(true), disable: () => setEventLogEnabled(false), log: logEvent };
