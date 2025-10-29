// src/lib/appLifecycle.ts
import React from "react";
import { AppState } from "react-native";

type Listener = () => void;

const pauseLs = new Set<Listener>();
const resumeLs = new Set<Listener>();

export function onAppPause(fn: Listener) {
  pauseLs.add(fn);
  return () => pauseLs.delete(fn);
}

export function onAppResume(fn: Listener) {
  resumeLs.add(fn);
  return () => resumeLs.delete(fn);
}

// Kall denne én gang i root (f.eks. i _layout)
export function useAppLifecycleBridge(saveSnapshot?: () => Promise<void> | void) {
  React.useEffect(() => {
    const sub = AppState.addEventListener("change", async (s) => {
      if (s === "active") {
        resumeLs.forEach((f) => f());
      } else {
        if (saveSnapshot) await saveSnapshot();
        pauseLs.forEach((f) => f());
      }
    });
    return () => sub.remove();
  }, [saveSnapshot]);
}
