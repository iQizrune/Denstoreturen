// src/partials/StopModule.tsx
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";

import ArrivalPoster from "@/components/posters/ArrivalPoster";
import type { StopQ } from "@/src/banks/stopQuizAdapter";

type Props = {
  /** Synlighet av stopp-modulen (overlay over play) */
  visible: boolean;
  /** Navn/id på stoppet (brukes for å hente riktig quiz) */
  stopName: string;

  /** Hent stopp-quiz for gitt navn. Returner tomt array hvis intet funn. */
  getStopQuiz: (name: string) => StopQ[];

  /** Callback når brukeren bør få et byvåpen (perfekt runde) */
  onAwardByvapen?: (city: string) => void;

  /** Valgfrie snarveier (kart, neste etappe) fra ArrivalPoster */
  onOpenMap?: () => void;
  onNextEtappe?: () => void;

  /** Resultat etter endt stopp (kalles før onExit) */
  onComplete?: (r: { stopName: string; correct: number; total: number }) => void;

  /** Lukk stopp-modulen og fortsett ruten (obligatorisk) */
  onExit: () => void;
};

type Phase = "poster" | "quiz" | "done";

export default function StopModule({
  visible,
  stopName,
  getStopQuiz,
  onAwardByvapen,
  onOpenMap,
  onNextEtappe,
  onComplete,
  onExit,
}: Props) {
  // hent quiz (memo for ytelse)
  const quiz: StopQ[] = useMemo(() => {
    try {
      return getStopQuiz(stopName) ?? [];
    } catch {
      return [];
    }
  }, [stopName, getStopQuiz]);

  const total = quiz.length;

  // lokal state
  const [phase, setPhase] = useState<Phase>("poster");
  const [i, setI] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [locked, setLocked] = useState(false);
  const [chosen, setChosen] = useState<string | null>(null);

  // reset ved nytt stopp / når vises
  useEffect(() => {
    if (!visible) return;
    setPhase("poster");
    setI(0);
    setCorrect(0);
    setLocked(false);
    setChosen(null);
  }, [visible, stopName]);

  // start-knappen fra ArrivalPoster
  const startQuiz = () => {
    if (total <= 0) {
      // Ingen spørsmål → direkte til done
      setPhase("done");
      return;
    }
    setPhase("quiz");
  };

  // velg svar i quiz
  const pick = (optId: string) => {
    if (phase !== "quiz" || locked) return;
    const q = quiz[i];
    if (!q) return;

    setChosen(optId);
    const chosenOpt = q.options?.find((o) => o.id === optId);
    if (chosenOpt?.isCorrect) {
      setCorrect((c) => c + 1);
    }

    setLocked(true);

    // auto-neste etter lite delay
    setTimeout(() => {
      const nxt = i + 1;
      if (nxt < total) {
        setI(nxt);
        setChosen(null);
        setLocked(false);
      } else {
        setPhase("done");
      }
    }, 550);
  };

  // ferdig-fase: award + onComplete
  useEffect(() => {
    if (phase !== "done") return;
    onComplete?.({ stopName, correct, total });
    if (total > 0 && correct === total) {
      onAwardByvapen?.(stopName);
    }
  }, [phase, stopName, correct, total, onComplete, onAwardByvapen]);

  if (!visible) return null;

  const q = phase === "quiz" ? quiz[i] : null;

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.overlay} pointerEvents="auto">
        <View style={styles.card}>
          {/* POSTER */}
          {phase === "poster" && (
            <ArrivalPoster
              stopName={stopName}
              onStart={startQuiz}
              buttonText="Start stopp-oppdrag"
              // valgfritt:
              // onStartByquiz={startQuiz}
              // cityName={stopName}
              // username={...}
              // logoSource={require("@/assets/norquiz-logo.png")}
            />
          )}

          {/* QUIZ */}
          {phase === "quiz" && q && (
            <ScrollView
              contentContainerStyle={{ paddingBottom: 8 }}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.headSmall}>
                Oppdrag • {i + 1} / {total}
              </Text>
              <Text style={styles.question}>{q.text}</Text>

              <View style={{ gap: 8 }}>
                {q.options?.map((o) => {
                  const isChosen = chosen === o.id;
                  const isCorrect = !!o.isCorrect;
                  let btn = styles.btn;
                  if (locked) {
                    if (isCorrect) btn = styles.btnCorrect;
                    else if (isChosen) btn = styles.btnWrong;
                  } else if (isChosen) {
                    btn = styles.btnChosen;
                  }
                  return (
                    <Pressable
                      key={o.id}
                      onPress={() => pick(o.id)}
                      style={btn}
                      android_ripple={{ color: "#d1d5db" }}
                    >
                      <Text style={styles.btnText}>{o.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          )}

          {/* DONE */}
          {phase === "done" && (
            <View style={{ gap: 12 }}>
              <Text style={styles.headSmall}>Ferdig</Text>
              <Text style={styles.doneText}>
                {correct} / {total} riktige
              </Text>

              <Pressable
                onPress={onExit}
                style={styles.cta}
                android_ripple={{ color: "#065f46" }}
              >
                <Text style={styles.ctaText}>Fortsett ruten</Text>
              </Pressable>

              <View style={styles.row}>
                {onOpenMap && (
                  <Pressable
                    onPress={onOpenMap}
                    style={styles.secondary}
                    android_ripple={{ color: "#1f2937" }}
                  >
                    <Text style={styles.secondaryText}>Se kart</Text>
                  </Pressable>
                )}
                {onNextEtappe && (
                  <Pressable
                    onPress={onNextEtappe}
                    style={styles.secondary}
                    android_ripple={{ color: "#1f2937" }}
                  >
                    <Text style={styles.secondaryText}>Neste etappe</Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

/* ===================== Styles ===================== */
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    width: "94%",
    maxWidth: 520,
    backgroundColor: "#111827",
    borderColor: "#374151",
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
  },
  headSmall: {
    color: "#9ca3af",
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  question: {
    color: "white",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },
  btn: {
    backgroundColor: "#e5e7eb",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  btnChosen: {
    backgroundColor: "#d1d5db",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  btnCorrect: {
    backgroundColor: "#16a34a",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  btnWrong: {
    backgroundColor: "#dc2626",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  btnText: {
    color: "#111827",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 16,
  },
  doneText: {
    color: "white",
    fontWeight: "800",
    textAlign: "center",
    fontSize: 20,
  },
  cta: {
    backgroundColor: "#10b981",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 8,
  },
  ctaText: {
    color: "white",
    textAlign: "center",
    fontWeight: "800",
  },
  row: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
    justifyContent: "space-between",
  },
  secondary: {
    flex: 1,
    backgroundColor: "#1f2937",
    borderColor: "#374151",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  secondaryText: {
    color: "white",
    textAlign: "center",
    fontWeight: "700",
  },
});
