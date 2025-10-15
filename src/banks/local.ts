export type QA = {
  q: string;
  options: { key: string; label: string; isCorrect: boolean }[];
};

export const BANK: QA[] = [
  {
    q: "Hvor mange meter vil du gå?",
    options: [
      { key: "A", label: "Ti meter", isCorrect: true },
      { key: "B", label: "Null meter", isCorrect: false },
    ],
  },
  {
    q: "Velg riktig påstand:",
    options: [
      { key: "A", label: "Riktig (+10)", isCorrect: true },
      { key: "B", label: "Feil (0)", isCorrect: false },
    ],
  },
  {
    q: "En til for å teste progresjon:",
    options: [
      { key: "A", label: "Gi poeng", isCorrect: true },
      { key: "B", label: "Ingen poeng", isCorrect: false },
    ],
  },
];
