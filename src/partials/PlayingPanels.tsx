import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";

type Props = {
  onCorrect?: () => void;
  onWrong?: () => void;
};

type QA = {
  q: string;
  options: { key: string; label: string; isCorrect: boolean }[];
};

const BANK: QA[] = [
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

export default function PlayingPanels({ onCorrect, onWrong }: Props) {
  const [idx, setIdx] = useState(0);
  const [answered, setAnswered] = useState<null | "correct" | "wrong">(null);

  const done = idx >= BANK.length;
  const qa = BANK[idx];

  function handlePick(isCorrect: boolean) {
    if (answered || done) return;
    setAnswered(isCorrect ? "correct" : "wrong");
    if (isCorrect) onCorrect?.(); else onWrong?.();
  }

  function next() {
    if (!answered) return;
    setIdx((i) => i + 1);
    setAnswered(null);
  }

  if (done) {
    return (
      <View style={{ padding: 16, gap: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: "700" }}>Ferdig med oppgaver 🎉</Text>
        <Text style={{ color: "#666" }}>Trykk “Fullfør spill →” for å se resultat.</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>
        Oppgave {idx + 1} av {BANK.length}
      </Text>
      <Text>{qa.q}</Text>

      {qa.options.map((opt) => (
        <Pressable
          key={opt.key}
          onPress={() => handlePick(opt.isCorrect)}
          disabled={!!answered}
          style={{
            backgroundColor:
              answered
                ? opt.isCorrect
                  ? "#16a34a"
                  : "#ef4444"
                : "#e5e7eb",
            padding: 12,
            borderRadius: 10,
          }}
        >
          <Text style={{ fontWeight: "600", color: answered ? "white" : "black" }}>
            {opt.key}) {opt.label}
          </Text>
        </Pressable>
      ))}

      {answered && (
        <>
          <Text>
            {answered === "correct" ? "Riktig! +10 meter" : "Feil. 0 meter"}
          </Text>
          <Pressable
            onPress={next}
            style={{ marginTop: 8, backgroundColor: "#60a5fa", padding: 12, borderRadius: 8 }}
          >
            <Text style={{ color: "white", fontWeight: "700" }}>Neste</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}
