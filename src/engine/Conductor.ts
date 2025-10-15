import { logEvent } from "../dev/EventLog";
import type { Phase, ConductorEvent } from "./types";

type Listener = (e: ConductorEvent) => void;

class Conductor {
  private phase: Phase = "home";
  private listeners: Listener[] = [];

  getPhase(): Phase {
    return this.phase;
  }

  on(fn: Listener): () => void {
    this.listeners.push(fn);
    return () => this.off(fn);
  }

  off(fn: Listener): void {
    this.listeners = this.listeners.filter((x) => x !== fn);
  }

  toPhase(next: Phase): void {
    if (next === this.phase) return;
    const prev = this.phase;
    this.phase = next;
    try { logEvent("phase-change", { from: prev, to: next }); } catch {}
    this.emit({ type: "phase-change", from: prev, to: next });
  }

  private emit(e: ConductorEvent): void {
    for (const fn of this.listeners) {
      try { fn(e); } catch {}
    }
  }
}

export { Conductor };
export default Conductor;
