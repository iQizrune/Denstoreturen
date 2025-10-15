export const theme = {
  colors: {
    surface: "#111827",
    surfaceAlt: "#1f2937",
    textMain: "#e5e7eb",
    textSub: "#cbd5e1",
    primary: "#60a5fa",
    primaryOn: "#0b1220",
    neutral: "#e5e7eb",
    neutralOn: "#111827",
    ok: "#10b981",
    err: "#ef4444",
    warn: "#fbbf24",
    ripple: "#334155"
  }
} as const;
export type Theme = typeof theme;
