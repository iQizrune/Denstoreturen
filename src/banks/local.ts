export type QA = {
  q: string;
  options: { key: string; label: string; isCorrect: boolean }[];
};

export const BANKS: Record<string, QA[]> = {
  general: [
    { q: "Hvor mange meter vil du gå?",
      options: [
        { key: "A", label: "Ti meter", isCorrect: true },
        { key: "B", label: "Null meter", isCorrect: false },
      ],
    },
    { q: "Velg riktig påstand:",
      options: [
        { key: "A", label: "Riktig (+10)", isCorrect: true },
        { key: "B", label: "Feil (0)", isCorrect: false },
      ],
    },
    { q: "En til for å teste progresjon:",
      options: [
        { key: "A", label: "Gi poeng", isCorrect: true },
        { key: "B", label: "Ingen poeng", isCorrect: false },
      ],
    },
  ],
  kunst: [
    { q: "Hvem malte 'Skrik'?",
      options: [
        { key: "A", label: "Edvard Munch", isCorrect: true },
        { key: "B", label: "Claude Monet", isCorrect: false },
      ],
    },
    { q: "Hvilken by har Munchmuseet?",
      options: [
        { key: "A", label: "Oslo", isCorrect: true },
        { key: "B", label: "Bergen", isCorrect: false },
      ],
    },
    { q: "Skulpturpark i Oslo?",
      options: [
        { key: "A", label: "Vigelandsparken", isCorrect: true },
        { key: "B", label: "Bryggen", isCorrect: false },
      ],
    },
  ],
};
