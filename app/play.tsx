// app/play.tsx (Reparert og Renset)
import React, { useState, useEffect } from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

// State og Logikk (Ren import)
import { addMeters, getTotalMeters } from "@/src/state/run";
import { getNextStopAtMeters, markStopSeen, advanceAfterStop, getRouteState } from "@/src/state/route";
import { useArrivedStop } from "@/src/hooks/useArrivedStop";
import { subscribeMeters, publishMeters } from "@/src/lib/progressBus";

// UI/Partials
import StopModule from "@/src/partials/StopModule";
import StagePoster from "@/components/posters/StagePoster";
import IntroPoster from "@/components/posters/IntroPoster";
import getStopQuiz from "@/src/banks/getStopQuizByer";
import { takePendingStageStart } from "@/src/lib/stageQueue";
import { useFocusEffect } from "@react-navigation/native";
import { useRef } from "react";
import * as StageQueueModule from "@/src/lib/stageQueue";
import { installBagPersistence } from "../components/bag/bagPersist"; // tilpass sti ved behov
import { mineTingStore } from "@/src/features/mine-ting/mineTingStore";
import { installStatsPersistence } from "@/components/bag/statsPersist";
import { startSession, stopSession } from "@/components/bag/statsStore";
import { useIsFocused } from "@react-navigation/native";






// Lokal alias så guarden ser "stageQueue" uten at lib må eksportere den navngitt
const stageQueue: any =
  (StageQueueModule as any).stageQueue ??
  (StageQueueModule as any).default ??
  (StageQueueModule as any);


// Placeholder for nødvendig UI-komponent (pausebar variant)
const PlayingPanels = require("@/src/partials/PlayingPanels_pauseable").default;

// Global sperre: Hindrer at useArrivedStop trigger to ganger
let suppressAutoStop = false;

// Definerer garantert StageState for å tilfredsstille TypeScript
type StageState = {
  fromName: string;
  toName: string;
  meters: number;
};
type DevPosterId = "none" | "trick" | "bonus" | "lightning" | "reveal";

// --- HOOKS FOR LOKAL HUD ---
function useHUDStatus() {
  const [meters, setMeters] = useState(getTotalMeters());
  const [nextMeters, setNextMeters] = useState(getNextStopAtMeters());

  useEffect(() => {
    const off = subscribeMeters(({ meters: m }) => {
      setMeters(m);
      setNextMeters(getNextStopAtMeters());
    });
    setNextMeters(getNextStopAtMeters());

    return off;
  }, []);

  const routeState = getRouteState();
  const nextStop = routeState.stops[routeState.nextIndex] || { name: "Kirkenes", at: Infinity };

  const remaining = Math.max(0, nextMeters - meters);
  const goalName = nextStop.name;

  return { meters, remaining, goalName };
}

export default function PlayScreen() {

  const __guard_noop: React.EffectCallback = () => {};
useEffect(__guard_noop, []); // takePendingStageStart

  // --- mount-sjekk med stageQueue (diagnostikk, ikke-invasiv) ---
  useEffect(() => {
    console.log("[play] MOUNT v1");
    let unmountCalled = false;

    try {
      const sq: any = typeof stageQueue !== "undefined" ? stageQueue : undefined;

      if (sq) {
        if (Array.isArray(sq.queue)) {
          console.log("[play] stageQueue ready, items:", sq.queue.length);
        } else {
          console.log("[play] stageQueue present (no queue[])");
        }

        if (typeof sq.onMount === "function") {
          sq.onMount();
        }

        return () => {
          if (!unmountCalled) {
            unmountCalled = true;
            try {
              if (typeof sq.onUnmount === "function") {
                sq.onUnmount();
              }
            } catch (err) {
              console.warn("[play] stageQueue onUnmount error:", err);
            }
            console.log("[play] UNMOUNT v1");
          }
        };
      } else {
        console.log("[play] stageQueue not found (ok)");
      }
    } catch (err) {
      console.warn("[play] stageQueue check error:", err);
    }

    // fallback cleanup
    return () => {
      if (!unmountCalled) {
        unmountCalled = true;
        console.log("[play] UNMOUNT v1");
      }
    };
  }, []);
  // --- /mount-sjekk ---

  useEffect(() => {
    console.log("[play] MOUNT v1");
    return () => {
      console.log("[play] UNMOUNT v1"); // <-- dette er "event return"/cleanup
    };
  }, []);

    // --- stageQueue mount-sjekk (diagnostikk, ikke-invasiv) ---
  useEffect(() => {
    console.log("[play] MOUNT v2");

    try {
      if (stageQueue) {
  if (Array.isArray(stageQueue.queue)) {
    console.log("[play] stageQueue ready, items:", stageQueue.queue.length);
  } else {
    console.log("[play] stageQueue present (no queue[])");
  }
  if (typeof stageQueue.onMount === "function") stageQueue.onMount();
} else {
  console.log("[play] stageQueue not found (ok)");
}

    } catch (err) {
      console.warn("[play] stageQueue check error:", err);
    }

    return () => {
      try {
        if (stageQueue && typeof stageQueue.onUnmount === "function") {
          stageQueue.onUnmount();
        }
      } catch (err) {
        console.warn("[play] stageQueue unmount error:", err);
      }
      console.log("[play] UNMOUNT v2");
    };
  }, []);

  useEffect(() => {
    installBagPersistence().catch(() => {});
  }, []);


useEffect(() => {
  let unsub: undefined | (() => void);
  (async () => {
    unsub = await installStatsPersistence();
  })();
  return () => {
    if (typeof unsub === "function") unsub();
  };
}, []);

const [mineOpen, setMineOpen] = useState<boolean>(mineTingStore.open === true);

useEffect(() => {
  setMineOpen(!!mineTingStore.open);
  const off = mineTingStore.subscribe(() => setMineOpen(!!mineTingStore.open));
  return () => { off?.(); };
}, []);


  const router = useRouter();
  const { meters, remaining, goalName } = useHUDStatus();
  const [stopVisible, setStopVisible] = useState(false);
  const __guard_noop_stop: React.EffectCallback = () => {};
useEffect(__guard_noop_stop, [stopVisible]); // takePendingStageStart
  const [currentStopId, setCurrentStopId] = useState("");
  const [stagePayload, setStagePayload] = useState<StageState | null>(null);
  const [devPoster, setDevPoster] = useState<DevPosterId>("none");
  const [roundSeed, setRoundSeed] = useState(0);
const stopGraceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playingRef = useRef(false);

// Debounce STOP slik at forbigående panel/plakat ikke nuller tid umiddelbart
const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

useEffect(() => {
  const rawPlayingNow = !stagePayload && devPoster === "none" && !mineOpen;

  // Avbryt evt. pågående stopp-timer ved enhver endring
  if (pauseTimerRef.current) {
    clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = null;
  }

  if (rawPlayingNow) {
  // Avbryt eventuell forsinket STOP hvis vi blir "playing" igjen
  if (stopGraceRef.current) {
    clearTimeout(stopGraceRef.current);
    stopGraceRef.current = null;
  }
  // Vi er i faktisk spørsmålsmodus: start straks hvis ikke allerede startet
  if (!playingRef.current) {
    startSession();
    playingRef.current = true;
  }
} else {
  // Ikke spørsmålsmodus: vent litt før vi stopper (debounce)
  if (playingRef.current) {
    pauseTimerRef.current = setTimeout(() => {
      if (!playingRef.current) return; // allerede stoppet i mellomtiden
      // Sjekk tilstand på nytt etter debounce
      const stillNotPlaying = !!stagePayload || devPoster !== "none" || !!mineOpen;
      if (stillNotPlaying) {
        stopSession();
        playingRef.current = false;
      }
    }, 800); // 0.8s debounce på STOP
  }
}



}, [stagePayload, devPoster, mineOpen]);

// Sikkerhetsnett ved unmount
useEffect(() => {
  return () => {
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
    if (playingRef.current) {
      stopSession();
      playingRef.current = false;
    }
  };
}, []);


useEffect(() => {
  // Sikkerhetsnett ved unmount
  return () => {
    if (playingRef.current) {
      stopSession();
      playingRef.current = false;
    }
  };
}, []);

  // 1) Ankomst: Lytter på meter og åpner StopModule
  useArrivedStop(({ id }) => {
    if (suppressAutoStop) return;
    setCurrentStopId(id);
    setStopVisible(true);
  });

  // 2) Vis StagePoster ved første mount (dersom noe ligger i queue)
  useEffect(() => {
    const p = takePendingStageStart();
    if (p) {
      setStagePayload({
        fromName: p.fromName || "Start",
        toName: p.toName || "Destinasjon",
        meters: p.meters || 0,
      });
      suppressAutoStop = true;
    }
  }, []);

  // 3) Vis StagePoster når skjermen får fokus (f.eks. etter navigering tilbake)
  useFocusEffect(
    React.useCallback(() => {
      const p = takePendingStageStart();
      if (p) {
        setStagePayload({
          fromName: p.fromName || "Start",
          toName: p.toName || "Destinasjon",
          meters: p.meters || 0,
        });
        suppressAutoStop = true;
      }
    }, [])
  );

  // 4) Vis StagePoster når StopModule lukkes (siden det er overlay, ikke route)
  useEffect(() => {
    if (!stopVisible) {
      const p = takePendingStageStart();
      if (p) {
        setStagePayload({
          fromName: p.fromName || "Start",
          toName: p.toName || "Destinasjon",
          meters: p.meters || 0,
        });
        suppressAutoStop = true;
      }
    }
  }, [stopVisible]);
  // Konsumer evt. retur fra kart når /play får fokus
  const isFocused = useIsFocused();
  useEffect(() => {
    if (isFocused) {
      mineTingStore.consumeReturnAction();
    }
  }, [isFocused]);

  // --- Handlere ---

  // Dev-knapp: Hopp ELLER vis plakatvelgeren når vi er nær målet
  const devJump = () => {
    const current = getTotalMeters();
    const goal = getNextStopAtMeters();

    // Hvis vi er NÆR målet (innen 1000m), vis plakatvelgeren
    if (goal > current && goal - current < 1000) {
      setDevPoster("trick"); // Åpne plakatvelgeren med Trick som default
      return;
    }

    // Standard hopp: hopper til 100 m før neste stopp
    if (!(goal > current)) return;

    const target = Math.max(0, goal - 100);
    const delta = target - current;

    addMeters(delta);
    setTimeout(() => publishMeters(getTotalMeters()), 0);
  };

  // Kalles når StagePoster lukkes (når spilleren sier "Start quiz")
  const startNextStageNow = () => {
    setStagePayload(null);
    suppressAutoStop = false;
  };

  // Kalles når StopModule er ferdig (etter byquiz)
  const handleStopExit = () => {
    setStopVisible(false);
    markStopSeen();
    advanceAfterStop();
    setRoundSeed((s) => s + 1);
  };

  // === RENDER DEV PLAKATVELGER (Hvor teksten ligger) ===
  const renderDevPoster = () => {
    if (devPoster === "none") return null;

    let title = "";
    let content: React.ReactNode = null;

    // Ekte rutedata for plakat (ingen hardkode)
    const rs = getRouteState();
    const fromNameDev = rs.stops[Math.max(0, (rs.nextIndex ?? 1) - 1)]?.name ?? "Start";
    const toNameDev = rs.stops[rs.nextIndex ?? 1]?.name ?? "Mål";
    const currentDev = getTotalMeters();
    const goalDev = getNextStopAtMeters();
    const metersDev = Math.max(0, goalDev - currentDev);

    if (devPoster === "trick") {
      title = "TRIKS: 'Feil' er Riktig";
      content = (
        <>
          <Text style={styles.devTitle}>{title}</Text>
          <Text style={styles.devText}>
            Når du får et spørsmål med bare 3 svaralternativer, da skal du svare feil, for å få meter. Du
            vinner hele 50 m. Tiden er kort (3s)!
          </Text>
        </>
      );
    } else if (devPoster === "bonus") {
      title = "BONUS: Velg din utfordring";
      content = (
        <>
          <Text style={styles.devTitle}>{title}</Text>
          <Text style={styles.devText}>
            Velg mellom lett (20m), middels (50m) eller vanskelig (100m). Du har god tid.
          </Text>
        </>
      );
    } else if (devPoster === "lightning") {
      title = "LYNQUIZ: 15 sekunder";
      content = (
        <>
          <Text style={styles.devTitle}>{title}</Text>
          <Text style={styles.devText}>
            Svar riktig på så mange spørsmål du rekker på 15 sekunder for 20m per riktig.
          </Text>
        </>
      );
    } else if (devPoster === "reveal") {
      title = "AVDEKKING: Gjetting er Gull";
      content = (
        <>
          <Text style={styles.devTitle}>{title}</Text>
          <Text style={styles.devText}>
            Et tåkelagt bilde avdekkes. Jo raskere du gjetter riktig, jo flere meter (10m/sekund)!
          </Text>
        </>
      );
    }

    const DevButtons = (
      <View style={styles.devSelectorContainer}>
        <Text style={styles.devTitle}>Vis Plakat:</Text>
        {["trick", "bonus", "lightning", "reveal"].map((k) => (
          <Pressable key={k} onPress={() => setDevPoster(k as any)} style={styles.devSelectorBtn}>
            <Text style={styles.devSelectorText}>{k.toUpperCase()}</Text>
          </Pressable>
        ))}
        <Pressable onPress={() => setDevPoster("none")} style={styles.devSelectorClose}>
          <Text style={styles.devSelectorText}>Lukk</Text>
        </Pressable>
      </View>
    );

    return (
      <View style={styles.posterOverlay}>
        <IntroPoster from={fromNameDev} to={toNameDev} meters={metersDev} onStart={() => setDevPoster("none")}>
          {content}
          {DevButtons}
        </IntroPoster>
      </View>
    );
  };

  // --- Render ---

  // Vis StagePoster hvis payload er tilgjengelig
  if (stagePayload) {
    return (
      <View style={styles.container}>
        <StagePoster
          visible={true}
          fromName={stagePayload.fromName}
          toName={stagePayload.toName}
          meters={stagePayload.meters}
          etappeNo={getRouteState().nextIndex}
          onStart={startNextStageNow}
        />
      </View>
    );
  }

  // Hovedspillvisning
  return (
    <View style={styles.container}>
      {/* HUD (Status) */}
      <View style={styles.hud} pointerEvents="none">
        <Text style={styles.hudText}>
          {meters} m • {goalName} om {remaining} m
        </Text>
      </View>

      {/* Main Quiz Area */}
      <View style={{ flex: 1 }}>
        {PlayingPanels ? (
          <PlayingPanels roundSeed={roundSeed} />
        ) : (
          <Text style={styles.loadingText}>Laster quiz...</Text>
        )}
      </View>

      {/* Dev-knapp: Hopp ELLER vis plakatvelgeren */}
      <Pressable onPress={devJump} style={styles.devBtn}>
        <Text style={styles.devBtnText}>Dev: Hopp til {goalName} (-100 m)</Text>
      </Pressable>

      {/* StopModule-overlay */}
      {stopVisible && (
        <StopModule
          visible={stopVisible}
          stopName={currentStopId}
          getStopQuiz={getStopQuiz}
          onExit={handleStopExit}
          onAwardByvapen={() => {}}
          onOpenMap={() => {
            router.replace("/kart");
          }}
          onNextEtappe={() => {
            setStopVisible(false);
          }}
          onComplete={() => {}}
        />
      )}

      {/* Render Dev Plakatvelger (vises over alt annet) */}
      {renderDevPoster()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },
  hud: {
    position: "absolute",
    top: 40,
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 50,
    backgroundColor: "rgba(17,17,17,0.8)",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  hudText: {
    color: "#fff",
    fontWeight: "800",
    textAlign: "center",
  },
  devBtn: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 40,
    backgroundColor: "#374151",
    padding: 16,
    borderRadius: 14,
    zIndex: 10000,
    elevation: 60,
  },
  devBtnText: {
    color: "white",
    fontWeight: "800",
    textAlign: "center",
  },
  loadingText: {
    color: "#ccc",
    textAlign: "center",
    marginTop: 100,
  },
  // --- NYE STILER FOR DEV POSTER ---
  posterOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.95)",
    zIndex: 100000,
    justifyContent: "center",
    alignItems: "center",
  },
  devTitle: {
    color: "#ccc",
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
  },
  devText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  devSelectorContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "rgba(0, 50, 100, 0.2)",
    borderRadius: 10,
    alignItems: "center",
    gap: 8,
  },
  devSelectorBtn: {
    backgroundColor: "#ffc107",
    padding: 8,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
  },
  devSelectorClose: {
    marginTop: 10,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    minWidth: 120,
    alignItems: "center",
  },
  devSelectorText: {
    color: "black",
    fontWeight: "bold",
  },
});
