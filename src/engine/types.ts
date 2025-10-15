export type Phase = "home" | "play" | "stop" | "results";

export type ConductorEvent =
  | { type: "phase-change"; from?: Phase; to: Phase };
