
// src/features/mine-ting/mineTingStore.ts
// Auto-generated update (2025-10-27): select-modus, flere footer-knapper og lockClose-støtte.

export type HelpItemStatus = "uncollected" | "collected" | "used-correct" | "used-wrong";
export type HelpItem = { id: string; name: string; key: string; status: HelpItemStatus };

export type FooterBtn = { label: string; onPress: () => void; variant?: "primary" | "ghost" };

type Listener = () => void;

type SelectHelperCtx = {
  title?: string;
  allowKeys?: string[];               // hvis satt: kun disse key-ene er valgbar liste
  onPick: (item: HelpItem) => void;   // kalles når bruker velger et item
  onCancel?: () => void;              // kalles hvis bruker avbryter / "vet ikke"
};

type Mode = "view" | "select";

class MineTingStore {
  private _open = false;
  private _disabled = false; // "under aktivt spørsmål"
  private listeners: Set<Listener> = new Set();

  private _mode: Mode = "view";
  private _selectCtx?: SelectHelperCtx;

  // Footer-knapper og close-lås
  private _footerButtons: FooterBtn[] = [];
  private _lockClose = false;

  // midlertidig demo-data (byttes ut når ekte state kobles)
  private _items: HelpItem[] = [
    { id: "i1", name: "Harpun", key: "harpun", status: "collected" },
    { id: "i2", name: "Laks", key: "laks", status: "collected" },
  ];

  get open() { return this._open; }
  get disabled() { return this._disabled; }
  get mode() { return this._mode; }
  get selectCtx() { return this._selectCtx; }
  get items() { return this._items; }

  get footerButtons() { return this._footerButtons; }
  get lockClose() { return this._lockClose; }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => { this.listeners.delete(fn); };
  }
  
  private notify() { this.listeners.forEach((fn) => fn()); }

  // Åpne/lukk panel i vanlig visning
  openPanel() {
    if (!this._disabled) {
      this._mode = "view";
      this._open = true;
      this._selectCtx = undefined;
      this._footerButtons = [];
      this._lockClose = false;
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
    if (disabled && this._open) {
      this._open = false;
    }
    this.notify();
  }

  // === Velg hjelpemiddel-modus ===
  openSelectHelper(ctx: SelectHelperCtx) {
    this._mode = "select";
    this._selectCtx = ctx;
    this._open = true;
    this._footerButtons = [];
    this._lockClose = false;
    this.notify();
  }
  pickItem(itemId: string) {
    if (this._mode !== "select" || !this._selectCtx) return;
    const item = this._items.find((x) => x.id === itemId);
    if (!item) return;
    try {
      this._selectCtx.onPick(item);
    } finally {
      // onPick kan velge å åpne panelet i view med footer-knapper.
      // Derfor endrer vi IKKE state her men lar onPick styre via openPanel*/closePanel.
    }
  }
  cancelSelect() {
    const onCancel = this._selectCtx?.onCancel;
    this._mode = "view";
    this._selectCtx = undefined;
    this._open = true; // tilbake til panelet i visning
    this._footerButtons = [];
    this._lockClose = false;
    this.notify();
    try { onCancel?.(); } catch {}
  }

  // === Footer-API ===
  openPanelWithFooter(label: string, action: () => void, lockClose = false) {
    this._mode = "view";
    this._open = true;
    this._selectCtx = undefined;
    this._footerButtons = [{ label, onPress: action, variant: "primary" }];
    this._lockClose = lockClose;
    this.notify();
  }

  openPanelWithFooterButtons(buttons: FooterBtn[], lockClose = false) {
    this._mode = "view";
    this._open = true;
    this._selectCtx = undefined;
    this._footerButtons = buttons;
    this._lockClose = lockClose;
    this.notify();
  }

  triggerFooterAction() {
    const btn = this._footerButtons[0];
    this._footerButtons = [];
    this._lockClose = false;
    this._open = false;
    this.notify();
    try { btn?.onPress(); } catch {}
  }

  triggerFooterByIndex(i: number) {
    const btn = this._footerButtons[i];
    this._footerButtons = [];
    this._lockClose = false;
    this._open = false;
    this.notify();
    try { btn?.onPress(); } catch {}
  }

  // Oppdater item-status
  setItemStatusByKey(key: string, status: HelpItemStatus) {
    this._items = this._items.map((it) => (it.key === key ? { ...it, status } : it));
    this.notify();
  }
  setItemStatusById(id: string, status: HelpItemStatus) {
    this._items = this._items.map((it) => (it.id === id ? { ...it, status } : it));
    this.notify();
  }

  // Midlertidig verktøy: oppdater demo-items
  __setDemoItems(items: HelpItem[]) {
    this._items = items;
    this.notify();
  }
}

export const mineTingStore = new MineTingStore();
