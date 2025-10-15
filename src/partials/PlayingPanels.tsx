import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";

type Props = {
  onCorrect?: () => void;
  onWrong?: () => void;
};

export default function PlayingPanels({ onCorrect, onWrong }: Props) {
  const [answered, setAnswered] = useState<null | "correct" | "wrong">(null);

  const question = "Hvor mange meter vil du gå?";
  const options = [
    { key: "A", label: "Ti meter", isCorrect: true },
    { key: "B", label: "Null meter", isCorrect: false },
  ];

  function handlePick(isCorrect: boolean) {
    if (answered) return;
    setAnswered(isCorrect ? "correct" : "wrong");
    if (isCorrect) onCorrect?.(); else onWrong?.();
  }

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>{question}</Text>

      {options.map((opt) => (
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
        <Text style={{ marginTop: 4 }}>
          {answered === "correct" ? "Riktig! +10 meter" : "Feil. 0 meter"}
        </Text>
      )}
    </View>
  );
}
