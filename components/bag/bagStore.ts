// Minimal, modulær bag-store uten ekstern state-manager.
// In-memory nå; kan enkelt byttes til AsyncStorage senere.

export type BagItem =
  | { id: string; kind: "coat"; city: string; earnedAt: number }
  | { id: string; kind: "help"; helpId: string; earnedAt: number }
  | { id: string; kind: "other"; title: string; meta?: Record<string, unknown> };

type Listener = () => void;

const items: BagItem[] = [];
const listeners = new Set<Listener>();

export function getItems() {
  return items.slice();
}

export function subscribe(fn: Listener) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

function emit() {
  for (const fn of listeners) fn();
}

// --- Coats (byvåpen) ---
export function hasCoat(city: string) {
  return items.some((it) => it.kind === "coat" && it.city === city);
}

export function addCoat(city: string) {
  if (hasCoat(city)) return false;
  items.push({
    id: `coat:${city}:${Date.now()}`,
    kind: "coat",
    city,
    earnedAt: Date.now(),
  });
  emit();
  return true;
}

// --- Help items ---
export function addHelp(helpId: string) {
  items.push({
    id: `help:${helpId}:${Date.now()}`,
    kind: "help",
    helpId,
    earnedAt: Date.now(),
  });
  emit();
}
// Tømmer sekken i minne og varsler abonnenter
export function clearRuntime(): void {
  items.length = 0;
  emit();
}


export function consumeHelp(itemId: string): boolean {
  const idx = items.findIndex(it => it.id === itemId && it.kind === "help");
  if (idx >= 0) {
    items.splice(idx, 1);
    emit();
    return true;
  }
  return false;
}

// Generic add (kept for backwards compat)
export function addItem(item: BagItem) {
  items.push(item);
  emit();
}
