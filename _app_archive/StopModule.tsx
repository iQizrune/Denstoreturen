// components/StopModule.tsx
// Fullskjerms stoppemodul: velkomstplakat → quiz (6 Q) → oppsummering
// Egenskaper:
// - Leser spørsmål via getStopQuiz(stopName)
// - Nedtelling per spørsmål (15s). Går automatisk videre ved timeout.
// - Byvåpen ved >=5 riktige (addCoat + publishAwardCoat)
// - Spesialtilfelle 4 riktige: vis hjelpemiddel-plakat. Riktig valg => byvåpen.
// - Viser "Mine ting" (BagPanel) i ferdig-skjermen.
// - KUN UI/flow. Ingen global state muteres utover addCoat + publishAwardCoat.

import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, FlatList, Modal } from "react-native";

import ArrivalPoster from "./ArrivalPoster";
import BagPanel from "./bag/BagPanel";
import { BagIcon } from "./bag/BagIcon";
import { publishAwardCoat } from "../app/lib/kartBus"
import { addCoat } from "./bag/bagStore";

// Bank-typer
export type Difficulty = "enkel" | "medium" | "vanskelig" | "umulig";
export type QOption = { id: string; label: string };
export type Q = {
  id: string;
  text: string;
  kind?: "text" | "flag" | "reveal" | "trick" | "bonus";
  options: QOption[];
  correctId: string;
  meta?: { difficulty?: Difficulty };
};

type Phase = "idle" | "poster" | "playing" | "done";

export type StopModuleProps = {
  /** Vis/Skjul hele overlayet */
  visible: boolean;
  /** Slug/navn på stopp, f.eks. "sandefjord" */
  stopName: string;
  /** Spillernavn – brukes i tittelen på “Mine ting” */
  username?: string;

  /** Hent 6 spørsmål for stoppet */
  getStopQuiz: (stopName: string) => Q[];

  /** Kalles når byvåpen deles ut (valgfri) */
  onAwardByvapen?: (city: string) => void;
  /** Åpne kart fra ferdig-skjerm (valgfri) */
  onOpenMap?: () => void;
  /** Neste etappe (valgfri) */
  onNextEtappe?: () => void;
  /** Ferdig-callback med resultat (valgfri) */
  onComplete?: (r: { stopName: string; correct: number; total: number }) => void;

  /** Lukk modulen (påkrevd – skjuler overlay hos forelder) */
  onExit: () => void;
};

const QUESTION_MS = 15_000;
const TICK_MS = 100;
const AWARD_MIN_CORRECT = 5; // 5 av 6 gir byvåpen

export default function StopModule(props: StopModuleProps) {
  const {
    visible,
    stopName,
    username,
    getStopQuiz,
    onAwardByvapen,
    onOpenMap,
    onNextEtappe,
    onComplete,
    onExit,
  } = props;

  const [phase, setPhase] = useState<Phase>("idle");
  const [qIndex, setQIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [remainingMs, setRemainingMs] = useState(QUESTION_MS);
  const [bagOpen, setBagOpen] = useState(false);
  const [awardedLocal, setAwardedLocal] = useState(false);

  // 4/6 hjelpemiddel-plakat (intern enkel modal – ingen eksterne imports)
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpStopId, setHelpStopId] = useState<string | null>(null);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Les spørsmål når overlay skal brukes
  const quiz = useMemo(() => {
    if (!visible) return [];
    if (phase === "idle") return [];
    try {
      const qs = getStopQuiz(stopName) ?? [];
      // Sikre at alle har fire alternativer (krav: 4, bortsett fra trick som vi ikke bruker her)
      return qs.map((q) => ({
        ...q,
        options: Array.isArray(q.options) ? q.options.slice(0, 4) : [],
      }));
    } catch (e) {
      console.warn("[StopModule] getStopQuiz feilet:", e);
      return [];
    }
  }, [visible, phase, stopName, getStopQuiz]);

  // Synkroniser synlighet → nullstill
  useEffect(() => {
    if (visible) {
      setPhase("poster");
      setQIndex(0);
      setCorrect(0);
      setRemainingMs(QUESTION_MS);
      setBagOpen(false);
      setAwardedLocal(false);
      setHelpOpen(false);
      setHelpStopId(null);
    } else if (!visible && phase !== "idle") {
      cleanupTicker();
      setPhase("idle");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Start quiz fra velkomstplakat
  function startByquiz() {
    if (!visible) return;
    setPhase("playing");
    setQIndex(0);
    setCorrect(0);
    setRemainingMs(QUESTION_MS);
  }

  // Ticker (kun mens vi spiller)
  useEffect(() => {
    if (phase !== "playing") return;
    cleanupTicker();
    tickRef.current = setInterval(() => {
      setRemainingMs((ms) => Math.max(0, ms - TICK_MS));
    }, TICK_MS);
    return cleanupTicker;
  }, [phase, qIndex]);

  // Neste ved timeout
  useEffect(() => {
    if (phase !== "playing") return;
    if (remainingMs > 0) return;
    goNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingMs, phase]);

  function cleanupTicker() {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }

  // Besvarelse
  function answer(optionId: string) {
    if (phase !== "playing") return;
    const q = quiz[qIndex];
    if (!q) return;
    const hit = q.correctId === optionId;
    if (hit) setCorrect((c) => c + 1);
    goNext();
  }

  function goNext() {
    const next = qIndex + 1;
    if (next >= quiz.length) {
      cleanupTicker();
      setPhase("done");
    } else {
      setQIndex(next);
      setRemainingMs(QUESTION_MS);
    }
  }

  // Ferdig-skjerm bivirkninger
  useEffect(() => {
    if (phase !== "done") return;
    const total = quiz.length || 6;
    // Spesialcase 4/6 -> hjelpemiddel-plakat (før alt annet)
    if (correct === 4) {
      setHelpStopId(stopName);
      setHelpOpen(true);
      return;
    }

    // Øvrig flyt: ved >=5 riktige – del ut byvåpen én gang
    if (correct >= AWARD_MIN_CORRECT && !awardedLocal) {
      try {
        addCoat(stopName);
      } catch {}
      try {
        publishAwardCoat({ type: "award-coat", stopId: stopName, perfect: correct === 6 });
      } catch {}
      try {
        onAwardByvapen?.(stopName);
      } catch {}
      setAwardedLocal(true);
    }

    // Kall resultat-callback (uansett)
    try {
      onComplete?.({ stopName, correct, total });
    } catch {}

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Gå til neste etappe og lukk overlay
  function proceedNextEtappe() {
    try {
      onNextEtappe?.();
    } finally {
      handleExit();
    }
  }

  function handleExit() {
    cleanupTicker();
    setPhase("idle");
    setQIndex(0);
    setCorrect(0);
    setRemainingMs(QUESTION_MS);
    setBagOpen(false);
    setAwardedLocal(false);
    setHelpOpen(false);
    setHelpStopId(null);
    onExit?.();
  }

  if (!visible) return null;

  // --- Render ---

  if (phase === "poster") {
    return (
      <ArrivalPoster cityName={stopName} onStartByquiz={startByquiz} username={username} />
    );
  }

  if (phase === "playing") {
    const q = quiz[qIndex];
    const total = quiz.length || 1;
    const pct = 1 - remainingMs / QUESTION_MS;

    return (
      <View
        pointerEvents="auto"
        style={{
          position: "absolute",
          left: 0, right: 0, top: 0, bottom: 0,
          backgroundColor: "#0b132b",
          padding: 16,
        }}
      >
        <Text style={{ color: "#9ca3af", marginBottom: 8 }}>
          {stopName} – Spørsmål {Math.min(qIndex + 1, total)} av {total} · {Math.ceil(remainingMs / 1000)}s
        </Text>

        {/* Progressbar (grønn→rød, enkel lineær) */}
        <View style={{ height: 8, backgroundColor: "#0f172a", borderRadius: 999, overflow: "hidden", marginBottom: 10 }}>
          <View style={{ height: "100%", width: `${Math.min(100, Math.max(0, pct * 100))}%`, backgroundColor: pct < 0.5 ? "#22c55e" : pct < 0.8 ? "#fbbf24" : "#ef4444" }} />
        </View>

        <View style={{ padding: 16, borderRadius: 14, backgroundColor: "#111827", borderColor: "#374151", borderWidth: 1 }}>
          <Text style={{ color: "white", fontSize: 18, fontWeight: "700", marginBottom: 12 }}>
            {q?.text ?? "Fant ingen spørsmål for dette stoppet."}
          </Text>

          <FlatList
            data={q?.options ?? []}
            keyExtractor={(o) => String(o.id)}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => answer(item.id)}
                android_ripple={{ color: "#334155" }}
                style={{ padding: 12, backgroundColor: "#1f2937", borderRadius: 12, marginBottom: 10 }}
              >
                <Text style={{ color: "white" }}>{item.label}</Text>
              </Pressable>
            )}
          />
        </View>
      </View>
    );
  }

  if (phase === "done") {
    const total = quiz.length || 6;
    const earned = correct >= AWARD_MIN_CORRECT;

    return (
      <View
        pointerEvents="auto"
        style={{
          position: "absolute",
          left: 0, right: 0, top: 0, bottom: 0,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.86)",
          padding: 24,
        }}
      >
        {/* HJELPEMIDDEL-MODAL for 4/6 */}
        <Modal visible={helpOpen} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "center", alignItems: "center", padding: 20 }}>
            <View style={{ width: "92%", maxWidth: 420, backgroundColor: "#111827", borderColor: "#374151", borderWidth: 1, borderRadius: 16, padding: 16 }}>
              <Text style={{ color: "white", fontSize: 18, fontWeight: "800", marginBottom: 8 }}>
                4 av 6 – vil du bruke et hjelpemiddel?
              </Text>
              <Text style={{ color: "#cbd5e1", marginBottom: 14 }}>
                Du mangler ett riktig svar for å vinne byvåpenet i {stopName}. Hvis du har det rette hjelpemiddelet i sekken, kan du bruke det nå for å snu ett feil svar til riktig.
              </Text>

              <View style={{ flexDirection: "row", gap: 8 }}>
                <Pressable
                  onPress={() => {
                    // Enkelt “valg”-UI – foreløpig uten kobling til spesifikke items.
                    // Forelder kan senere erstatte denne modalen med en dedikert komponent.
                    const hadCorrectTool = true; // <- senere: sjekk bag/sekken
                    setHelpOpen(false);
                    setHelpStopId(null);
                    if (hadCorrectTool) {
                      try { addCoat(stopName); } catch {}
                      try { publishAwardCoat({ type: "award-coat", stopId: stopName, perfect: false }); } catch {}
                    }
                    proceedNextEtappe();
                  }}
                  android_ripple={{ color: "#334155" }}
                  style={{ paddingVertical: 12, paddingHorizontal: 16, backgroundColor: "#2563eb", borderRadius: 10 }}
                >
                  <Text style={{ color: "white", fontWeight: "700" }}>Bruk hjelpemiddel</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setHelpOpen(false);
                    setHelpStopId(null);
                    proceedNextEtappe();
                  }}
                  android_ripple={{ color: "#334155" }}
                  style={{ paddingVertical: 12, paddingHorizontal: 16, backgroundColor: "#1f2937", borderRadius: 10, borderWidth: 1, borderColor: "#374151" }}
                >
                  <Text style={{ color: "white", fontWeight: "700" }}>Fortsett uten</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        <View
          style={{
            width: "90%", maxWidth: 420,
            borderRadius: 16, padding: 20,
            backgroundColor: "#111827",
            borderColor: "#374151", borderWidth: 1,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 20, fontWeight: "800", marginBottom: 8 }}>
            Byquiz ferdig
          </Text>
          <Text style={{ color: "#cbd5e1", marginBottom: 6 }}>
            Riktige: {correct} av {total}
          </Text>

          {earned ? (
            <>
              <View style={{ marginVertical: 10 }}>
                <BagIcon city={stopName} size={64} />
              </View>
              <View
                style={{
                  paddingVertical: 10, paddingHorizontal: 12,
                  backgroundColor: "#14532d", borderRadius: 10,
                  marginTop: 6, marginBottom: 10,
                  borderWidth: 1, borderColor: "#166534",
                }}
              >
                <Text style={{ color: "#bbf7d0", fontWeight: "800" }}>🛡️ Du vant byvåpenet!</Text>
              </View>
            </>
          ) : (
            <Text style={{ color: "#cbd5e1", marginVertical: 10 }}>
              Bedre lykke neste gang 🙂
            </Text>
          )}

          <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
            <Pressable
              onPress={() => setBagOpen(true)}
              android_ripple={{ color: "#334155" }}
              style={{
                paddingVertical: 12, paddingHorizontal: 16,
                backgroundColor: "#1f2937",
                borderRadius: 10, borderWidth: 1, borderColor: "#374151",
              }}
            >
              <Text style={{ color: "white", fontWeight: "700" }}>
                {username ? toPossessive(username) : "Mine ting"}
              </Text>
            </Pressable>

            <Pressable
              onPress={proceedNextEtappe}
              android_ripple={{ color: "#334155" }}
              style={{
                paddingVertical: 12, paddingHorizontal: 16,
                backgroundColor: "#2563eb", borderRadius: 10,
              }}
            >
              <Text style={{ color: "white", fontWeight: "700" }}>Neste etappe</Text>
            </Pressable>
          </View>
        </View>

        <BagPanel
          visible={bagOpen}
          onClose={() => setBagOpen(false)}
          onOpenMap={() => {
            setBagOpen(false);
            onOpenMap?.();
          }}
          title={username ? toPossessive(username) : undefined}
        />
      </View>
    );
  }

  return null;
}

// --- små hjelpere ---
function toPossessive(name?: string | null) {
  const n = (name ?? "").trim();
  if (!n) return "Mine ting";
  return /s$/i.test(n) ? `${n} ting` : `${n}s ting`;
}
