// src/partials/StopModule.tsx
// Fullskjerms stoppemodul: velkomstplakat → quiz (6 Q) → oppsummering

import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, FlatList, Modal } from "react-native";

import ArrivalPoster from "@/components/posters/ArrivalPoster";
import BagPanel from "@/components/bag/BagPanel";
import { BagIcon } from "@/components/bag/BagIcon";
import { addCoat } from "@/components/bag/bagStore";
import { publishAwardCoat } from "@/src/app-moved/kartBus";
import { publishStageStart } from "@/src/lib/stageBus";
import { queueStageStart } from "@/src/lib/stageQueue";
import { getStops } from "@/src/state/route";
import { STOP_CUM_METERS } from "@/src/data/stops";




// Tillat også StopQ fra adapteret (har isCorrect på option, ikke correctId på q)
import type { StopQ as AdapterStopQ } from "@/src/banks/stopQuizAdapter";

const toSlug = (s: string) =>
  String(s || '')
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, '')   // fjern diakritika
    .replace(/[^a-z0-9]+/g, '-')       // alt som ikke er [a-z0-9] -> bindestrek
    .replace(/^-+|-+$/g, '');          // trim bindestreker


// ===== Typer =====
export type Difficulty = "enkel" | "medium" | "vanskelig" | "umulig";
export type QOption = { id: string; label: string; isCorrect?: boolean };
export type Q = {
  id: string;
  text: string;
  kind?: "text" | "flag" | "reveal" | "trick" | "bonus";
  options: QOption[];
  correctId: string;
  meta?: { difficulty?: Difficulty; [k: string]: any };
};

type Phase = "idle" | "poster" | "playing" | "done";

export type StopModuleProps = {
  /** Vis/Skjul hele overlayet */
  visible: boolean;
  /** Slug/navn på stopp, f.eks. "sandefjord" */
  stopName: string;
  /** Spillernavn – brukes i tittelen på “Mine ting” */
  username?: string;

  /** Hent 6 spørsmål for stoppet – kan være Q[] (med correctId) eller StopQ[] (uten). */
  getStopQuiz: (stopName: string) => (Q | AdapterStopQ)[];

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

// ===== Konstanter =====
const QUESTION_MS = 15_000; // 15 sek per spørsmål
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

  const stopSlug = toSlug(stopName);
  const [phase, setPhase] = useState<Phase>("idle");
  const [qIndex, setQIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [remainingMs, setRemainingMs] = useState(QUESTION_MS);
  const [bagOpen, setBagOpen] = useState(false);
  const [awardedLocal, setAwardedLocal] = useState(false);

  // 4/6 hjelpemiddel-plakat (intern enkel modal)
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpStopId, setHelpStopId] = useState<string | null>(null);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ===== Normalisering: (Q | StopQ)[] -> Q[] (med correctId) =====
  function normalizeToQ(items: ReadonlyArray<Q | AdapterStopQ>): Q[] {
    return (items ?? []).map((it: any) => {
      // Allerede “Q” (har correctId)
      if (typeof it?.correctId === "string") {
        const options = Array.isArray(it?.options)
          ? it.options.map((o: any) => ({ id: String(o?.id ?? ""), label: String(o?.label ?? "") }))
          : [];
        return {
          id: String(it?.id ?? ""),
          text: String(it?.text ?? ""),
          kind: it?.kind,
          options,
          correctId: String(it?.correctId ?? ""),
          meta: it?.meta,
        } as Q;
      }
      // AdapterStopQ → finn første option med isCorrect === true, fallback: første option
      const opts = Array.isArray(it?.options) ? it.options : [];
      const hit = opts.find((o: any) => o?.isCorrect) ?? opts[0] ?? { id: "" };
      return {
        id: String(it?.id ?? ""),
        text: String(it?.text ?? ""),
        kind: it?.kind,
        options: opts.map((o: any) => ({ id: String(o?.id ?? ""), label: String(o?.label ?? "") })),
        correctId: String(hit?.id ?? ""),
        meta: it?.meta,
      } as Q;
    });
  }

  // Les + normaliser spørsmål når overlay skal brukes
  const quiz: Q[] = useMemo(() => {
    if (!visible) return [];
    if (phase === "idle") return [];
    try {
      const raw = (getStopQuiz(stopName) ?? []) as (Q | AdapterStopQ)[];
      const normalized: Q[] = normalizeToQ(raw);
      // Sikre at alle har maks fire alternativer (krav her)
      return normalized.map((q): Q => ({
        ...q,
        options: Array.isArray(q.options) ? q.options.slice(0, 4) : [],
      })) as Q[];
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
    if ((quiz?.length ?? 0) === 0) {
      // ingen spørsmål → direkte til done
      setPhase("done");
      return;
    }
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
    const q: Q | undefined = quiz[qIndex];
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

    // Ved ≥5 riktige – del ut byvåpen én gang
    if (correct >= AWARD_MIN_CORRECT && !awardedLocal) {
      try {
        addCoat(stopSlug);
      } catch {}
      try {
        publishAwardCoat({ type: "award-coat", stopId: stopSlug, perfect: correct === 6 });
      } catch {}
      try {
        onAwardByvapen?.(stopName);
      } catch {}
      setAwardedLocal(true);
    }

    // Resultat-callback (uansett)
    try {
      onComplete?.({ stopName, correct, total });
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

// Gå til neste etappe og lukk overlay
// src/partials/StopModule.tsx (Endelig Korrigert Logikk)

// Gå til neste etappe og lukk overlay
function proceedNextEtappe() {
  const stops = getStops();
  const currentStopIndex = stops.findIndex(s => s.id === stopName); // Index av Mandal
  const nextStop = stops[currentStopIndex + 1]; // Kristiansand
  const currentStop = stops[currentStopIndex];

  try {
    if (currentStop && nextStop) {
      const currentMeters = currentStop.at;
      const nextMeters = nextStop.at;

      // Legger inn riktig, sekvensiell etappe: (Stopp A) -> (Stopp B)
      queueStageStart({
        fromName: currentStop.name, // FRA: Mandal
        toName: nextStop.name,      // TIL: Kristiansand
        meters: Math.max(0, nextMeters - currentMeters),
      });
      console.log(`[StopModule] Stage queued: ${currentStop.name} -> ${nextStop.name}.`);
    } else {
        // Fallback for siste stopp
        queueStageStart({ fromName: stopName });
    }

    onNextEtappe?.();
  } catch (e) {
    console.log("[StopModule] onNextEtappe error", e);
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
    const q: Q | undefined = quiz[qIndex];
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
                    const hadCorrectTool = true; // TODO: sjekk bag
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
                <BagIcon slug={stopSlug} size={64} />
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

  {onOpenMap && (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel="Åpne kart"
    onPress={onOpenMap}
    style={{
      backgroundColor: "#334155",
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: "center",
      marginTop: 8,
    }}
  >
    <Text style={{ color: "#fff", fontWeight: "800" }}>Åpne kart</Text>
  </Pressable>
)}

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

        {bagOpen && (
  <BagPanel
    onClose={() => setBagOpen(false)}
    onOpenMap={() => {
      setBagOpen(false);
      onOpenMap?.();
    }}
    title={username ? toPossessive(username) : undefined}
  />
)}

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
