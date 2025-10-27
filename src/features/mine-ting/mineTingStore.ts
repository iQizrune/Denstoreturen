// Minimal lokal store uten eksterne lib. Enkel pub/sub for open/close + disable-state.
type Listener = () => void;

class MineTingStore {
  private _open = false;
  private _disabled = false; // "under aktivt spørsmål"
  private listeners: Set<Listener> = new Set();

  get open() {
    return this._open;
  }
  get disabled() {
    return this._disabled;
  }
    subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => { this.listeners.delete(fn); }; // returnerer void, ikke boolean
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }
  openPanel() {
    if (!this._disabled) {
      this._open = true;
      this.notify();
    }
  }
  closePanel() {
    this._open = false;
    this.notify();
  }
  // Koble til eksisterende "aktivt spørsmål"-signal senere
  setDisabled(disabled: boolean) {
    this._disabled = disabled;
    // hvis vi blir disabled midt i visning, lukk
    if (disabled && this._open) {
      this._open = false;
    }
    this.notify();
  }
}

export const mineTingStore = new MineTingStore();
