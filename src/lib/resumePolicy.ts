// src/lib/resumePolicy.ts

/** Hvor lenge vi regner en økt som “fortsettbar” (default: 10 min) */
export const RESUME_THRESHOLD_MS = 10 * 60_000;

/** 
 * Returnerer "resume" hvis siste lagring er nyere enn terskelen, ellers "prompt".
 * Du kan mocking-teste ved å sende inn `now`.
 */
export function decideResumeAction(
  lastSavedAt?: number,
  now: number = Date.now(),
  thresholdMs: number = RESUME_THRESHOLD_MS
): "resume" | "prompt" {
  if (!lastSavedAt || Number.isNaN(lastSavedAt)) return "prompt";
  return now - lastSavedAt < thresholdMs ? "resume" : "prompt";
}

/** Hjelpefunksjon som kjører valget for deg. */
export function performResumePolicy(opts: {
  lastSavedAt?: number;
  resumeGame: () => void;
  showResumePrompt: () => void;
  now?: number;
  thresholdMs?: number;
}) {
  const { lastSavedAt, resumeGame, showResumePrompt, now, thresholdMs } = opts;
  const decision = decideResumeAction(lastSavedAt, now, thresholdMs);
  if (decision === "resume") resumeGame();
  else showResumePrompt();
  return decision;
}
