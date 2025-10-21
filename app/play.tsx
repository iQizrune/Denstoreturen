// app/play.tsx
import React, { useEffect, useState, useMemo } from "react";
import { View, Pressable, Text } from "react-native";
import { getStops } from "@/src/state/route";
import { publishMeters, subscribeMeters } from "@/src/lib/progressBus";
import { addMeters, getTotalMeters } from "@/src/state/run";

// ⬇️ StopModule + quiz-henter (tilpass evt. stier)
import StopModule from "../src/partials/StopModule";
import getStopQuiz from "../src/banks/getStopQuizByer";
import { useArrivedStop } from "../src/hooks/useArrivedStop";


// --- lokale typer (enkelt) ---
type Stop = { id: string; name: string; at: number };

function findNextStopLocal(total: number, stops: Stop[]) {
  for (let i = 0; i < stops.length; i++) {
    if (total < stops[i].at) return stops[i];
  }
  return null;
}

export default function PlayScreen() {
  const [Panel, setPanel] = useState<any>(null);
  const [meters, setMeters] = useState<number>(getTotalMeters());
  const [next, setNext] = useState<Stop | null>(null);

  // --- StopModule state ---
  const [stopVisible, setStopVisible] = useState(false);
  const [stopName, setStopName] = useState<string>("");

  useArrivedStop(({ id }) => {
    setStopName(id);
    setStopVisible(true);
    });

  // last spørrepanelet lazy for å holde appen snappy
  useEffect(() => {
    let alive = true;
    import("@/src/partials/PlayingPanels")
      .then((m: any) => alive && setPanel(() => m.default || null))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Oppdater HUD + oppdag ankomst til stopp
  useEffect(() => {
    const unsub = subscribeMeters(({ meters: m }) => {
      setMeters(m);
      const s = getStops() as Stop[];
      const nxt = findNextStopLocal(m, s);
      setNext(nxt);

      // Hvis vi har nådd målet for etappen: vis stopmodule (én gang)
      if (nxt && m >= nxt.at && !stopVisible) {
        setStopName(nxt.name);
        setStopVisible(true);
      }
    });

    // init beregning basert på global state (uten å publisere)
    const s = getStops() as Stop[];
    const m0 = getTotalMeters();
    setNext(findNextStopLocal(m0, s));

    return () => unsub?.();
  }, [stopVisible]);

  // Dev-knapp: hopp til 100 m før neste stopp (riktig måte: oppdater state + publiser)
  const devJump = () => {
    const current = getTotalMeters();
    const s = getStops() as Stop[];
    const nxt = findNextStopLocal(current, s);
    if (!nxt) return;

    const target = Math.max(0, nxt.at - 100);
    const delta = target - current;
    if (delta <= 0) return;

    addMeters(delta);
    const total = getTotalMeters();
    setTimeout(() => publishMeters(total), 0);
  };

  // Når man fullfører stopmodule
  const handleStopComplete = () => {
    // her kan du evt. trigge ny etappe/legge til state, men vi lukker modulen nå
    setStopVisible(false);

    // Etter å ha lukket modulen, re-beregn neste stopp (kan ha flyttet deg til ny etappe)
    const s = getStops() as Stop[];
    const m = getTotalMeters();
    setNext(findNextStopLocal(m, s));
  };

  const remaining = useMemo(() => (next ? Math.max(0, next.at - meters) : 0), [next, meters]);

  // Render
  return (
    <View style={{ flex: 1, backgroundColor: "#111" }}>
      {/* HUD */}
      <View
        style={{
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
        }}
        pointerEvents="none"
      >
        <Text style={{ color: "#fff", fontWeight: "800", textAlign: "center" }}>
          {meters} m {next ? `• ${next.name} om ${remaining} m` : ""}
        </Text>
      </View>

      {/* Main-spill: PAUSES når stopmodule er synlig (renderes ikke) */}
      <View style={{ flex: 1 }}>
        {!stopVisible && Panel ? <Panel /> : null}
      </View>

      {/* Dev-knapp */}
      <Pressable
        onPress={devJump}
        accessibilityRole="button"
        hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 96,
          backgroundColor: "#374151",
          padding: 16,
          borderRadius: 14,
          zIndex: 10000,
          elevation: 60,
        }}
      >
        <Text style={{ color: "white", fontWeight: "800", textAlign: "center" }}>
          Dev: hopp til 100 m før neste stopp
        </Text>
      </Pressable>

      {/* StopModule-overlay (fullskjerm) */}
      <StopModule
        visible={stopVisible}
        stopName={stopName}
        // hent 6 spm for stoppet
        getStopQuiz={(name: string) => {
          try {
            return getStopQuiz(name) ?? [];
          } catch {
            return [];
          }
        }}
        // evt. wishekort/byvåpen når man klarer alt
        onAwardByvapen={(city: string) => {
          // valgfritt: du kan publisere en bus-event her om du har en egen kartBus
          // publishAwardCoat({ type: "award-coat", stopId: city, perfect: false })
        }}
        onOpenMap={() => {
          // valgfritt: naviger til kart
        }}
        onNextEtappe={() => {
          // valgfritt: hopp direkte til neste etappe
        }}
        onComplete={() => {
          // result: { stopName, correct, total } – kan logges/brukes
        }}
        onExit={handleStopComplete}
      />
    </View>
  );
}
