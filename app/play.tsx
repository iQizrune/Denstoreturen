// app/play.tsx (Reparert og Renset)
import React, { useState, useMemo, useEffect } from "react";
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
import { takePendingStageStart, StageStartPayload } from "../src/lib/stageQueue";

// Placeholder for nødvendig UI-komponent
const PlayingPanels = require("@/src/partials/PlayingPanels").default;

// Global sperre: Hindrer at useArrivedStop trigger to ganger
let suppressAutoStop = false;

// Definerer garantert StageState for å tilfredsstille TypeScript
type StageState = { 
    fromName: string; 
    toName: string; 
    meters: number;
};
type DevPosterId = 'none' | 'trick' | 'bonus' | 'lightning' | 'reveal';


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
  const router = useRouter();
  const { meters, remaining, goalName } = useHUDStatus();
  const [stopVisible, setStopVisible] = useState(false);
  const [currentStopId, setCurrentStopId] = useState("");
  const [stagePayload, setStagePayload] = useState<StageState | null>(null);
  const [devPoster, setDevPoster] = useState<DevPosterId>('none');
  const [roundSeed, setRoundSeed] = useState(0);
  



  // 1. Ankomst: Lytter på meter og navigerer automatisk
  useArrivedStop(({ id }) => {
    if (suppressAutoStop) return;
    
    setCurrentStopId(id);
    setStopVisible(true);
  });

  // 2. Queue-sjekk: Sjekk køen for StagePoster ved mount/fokus
  useEffect(() => {
    const p = takePendingStageStart();
    if (p) {
      setStagePayload({ 
        fromName: p.fromName || "Start", 
        toName: p.toName || "Destinasjon",
        meters: p.meters || 0 
      });
      suppressAutoStop = true;
    }
  }, []);

  // --- Handlere ---

  // Dev-knapp: Hopp ELLER vis plakatvelgeren når vi er nær målet
  const devJump = () => {
    const current = getTotalMeters();
    const goal = getNextStopAtMeters(); 
    
    // Hvis vi er NÆR målet (innen 1000m), vis plakatvelgeren
    if (goal > current && (goal - current) < 1000) { 
        setDevPoster('trick'); // Åpne plakatvelgeren med Trick som default
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
    setRoundSeed(s => s + 1);    
  };

  // === RENDER DEV PLAKATVELGER (Hvor teksten ligger) ===
  const renderDevPoster = () => {
    if (devPoster === 'none') return null;

    let title = "";
    let content: React.ReactNode = null;

    // Ekte rutedata for plakat (ingen hardkode)
    const rs = getRouteState();
    const fromNameDev = rs.stops[Math.max(0, (rs.nextIndex ?? 1) - 1)]?.name ?? "Start";
    const toNameDev   = rs.stops[rs.nextIndex ?? 1]?.name ?? "Mål";
    const currentDev  = getTotalMeters();
    const goalDev     = getNextStopAtMeters();
    const metersDev   = Math.max(0, goalDev - currentDev);


    // Logikk for innhold basert på valgt plakat
    if (devPoster === 'trick') {
        title = "TRIKS: 'Feil' er Riktig";
        content = (
            <>
                <Text style={styles.devTitle}>{title}</Text>
                <Text style={styles.devText}>Når du får et spørsmål med bare 3 svaralternativer, da skal du svare feil, for å få meter. Du vinner hele 50 m. Tiden er kort (3s)!</Text>
            </>
        );
    } else if (devPoster === 'bonus') {
        title = "BONUS: Velg din utfordring";
        content = (
            <>
                <Text style={styles.devTitle}>{title}</Text>
                <Text style={styles.devText}>Velg mellom lett (20m), middels (50m) eller vanskelig (100m). Du har god tid.</Text>
            </>
        );
    } else if (devPoster === 'lightning') {
        title = "LYNQUIZ: 15 sekunder";
        content = (
            <>
                <Text style={styles.devTitle}>{title}</Text>
                <Text style={styles.devText}>Svar riktig på så mange spørsmål du rekker på 15 sekunder for 20m per riktig.</Text>
            </>
        );
    } else if (devPoster === 'reveal') {
        title = "AVDEKKING: Gjetting er Gull";
        content = (
            <>
                <Text style={styles.devTitle}>{title}</Text>
                <Text style={styles.devText}>Et tåkelagt bilde avdekkes. Jo raskere du gjetter riktig, jo flere meter (10m/sekund)!</Text>
            </>
        );
    }
    
    // Dev-valgknapper
    const DevButtons = (
        <View style={styles.devSelectorContainer}>
            <Text style={styles.devTitle}>Vis Plakat:</Text>
            {['trick', 'bonus', 'lightning', 'reveal'].map(k => (
                <Pressable key={k} onPress={() => setDevPoster(k as any)} style={styles.devSelectorBtn}>
                    <Text style={styles.devSelectorText}>{k.toUpperCase()}</Text>
                </Pressable>
            ))}
            <Pressable onPress={() => setDevPoster('none')} style={styles.devSelectorClose}>
                <Text style={styles.devSelectorText}>Lukk</Text>
            </Pressable>
        </View>
    );

    return (
        <View style={styles.posterOverlay}>
            <IntroPoster 
                from={fromNameDev}
                to={toNameDev}
                meters={metersDev}
                onStart={() => setDevPoster('none')} // Simulerer start av quiz
            >
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
        {PlayingPanels ? <PlayingPanels roundSeed={roundSeed} /> : <Text style={styles.loadingText}>Laster quiz...</Text>}
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
          onOpenMap={() => { router.replace('/kart'); }}
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
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.95)',
    zIndex: 100000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  devTitle: {
    color: '#ccc',
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  devText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  devSelectorContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgba(0, 50, 100, 0.2)',
    borderRadius: 10,
    alignItems: 'center',
    gap: 8,
  },
  devSelectorBtn: {
    backgroundColor: '#ffc107',
    padding: 8,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  devSelectorClose: {
    marginTop: 10,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    minWidth: 120,
    alignItems: 'center',
  },
  devSelectorText: {
    color: 'black',
    fontWeight: 'bold',
  }
});