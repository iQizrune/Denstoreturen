import { POINTS_PER_CORRECT } from "@/src/config/game";
import { publishMeters } from '@/src/lib/progressBus';

type Phase = "intro" | "route" | "stop" | "pause" | "results";

type State = {
  phase: Phase;
  meters: number;
  correct: number;
  total: number;
  cat?: string;
};

type Listener = (s: Readonly<State>) => void;

const state: State = {
  phase: "intro",
  meters: 0,
  correct: 0,
  total: 0,
  cat: undefined,
};

let listeners: Listener[] = [];

function emit() {
  listeners.forEach((fn) => { try { fn({ ...state }); } catch {} });
}

export const conductor = {
  start(cat?: string) {
    state.phase = "route";
    state.meters = 0;
    state.correct = 0;
    state.total = 0;
    state.cat = cat;
    publishMeters(0);
    emit();
  },

  answer(isCorrect: boolean) {
    if (state.phase !== "route" && state.phase !== "stop") return;
    state.total += 1;
    if (isCorrect) {
      state.correct += 1;
      state.meters += POINTS_PER_CORRECT;
      publishMeters(state.meters);
    }
    emit();
  },

  finish() {
    state.phase = "results";
    emit();
  },

  getSnapshot(): Readonly<State> {
    return { ...state };
  },

  on(fn: Listener) {
    listeners.push(fn);
    fn({ ...state });
    return () => { listeners = listeners.filter((x) => x !== fn); };
  }
};
