// app/kart.tsx - Komplett kartskjerm med HybridMap og Lukk-knapp

import React, { useMemo, useState } from "react";
import { SafeAreaView, View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";

// State og Hooks
import { useCurrentStopIndex } from "@/src/hooks/useCurrentStopIndex";
import { useArrivedStop } from "@/src/hooks/useArrivedStop";

// Data og Utils
import { loadLegs } from "@/src/route/legsFromJson";
import { STOP_NAMES } from "@/src/data/stops";
import { getOrderedStops } from "@/src/route/stopsFromData";
import type { RouteLeg } from "@/src/types/route";

// UI Komponenter
import MapViewHybrid from "@/components/map/MapViewHybrid";
import ArrivalPoster from "@/components/posters/ArrivalPoster";
import StopModule from "../src/partials/StopModule"; 


export default function KartSvgScreen() {
  const router = useRouter(); // Henter router-objektet

  // Laster hele ruten (RouteLeg[]) kun én gang
  const LEGS: RouteLeg[] = useMemo(loadLegs, []);
  
  // Lokal state for visning av Arrival Poster/Stop Module
  const [currentLeg, setCurrentLeg] = useState<number>(0);
  const [arrivalVisible, setArrivalVisible] = useState(false);
  const [arrivalName, setArrivalName] = useState<string>("");
  const [stopModuleVisible, setStopModuleVisible] = useState(false);

  
  const currentStopIndex = useCurrentStopIndex();

  useArrivedStop(({ index }) => {
    // Fokuser kartet på ny etappe (starter ved dette stoppet)
    setCurrentLeg(Math.min(index, LEGS.length - 1));
    
    // Viser Arrival Poster hvis kartet er aktivt (dev/test)
    setArrivalName(STOP_NAMES[index] || "");
    setArrivalVisible(true);
  });

  // Henter antall etapper for HUD-visning
  const legsCount = LEGS.length;
  
  return (
    <SafeAreaView style={styles.root}>
      {/* HEADER OG KNAPPER */}
      <View style={styles.header}>
        <Text style={styles.title}>Kart over ruten</Text>
        
        {/* 1. LUKKEKNAPP (Navigator Back) */}
        <Pressable 
  onPress={() => (router.canGoBack() ? router.back() : router.replace('/play'))}
  style={styles.closeButton} 
>
    <Text style={styles.closeButtonText}>Lukk</Text>
</Pressable>
        
        {/* 2. ETAPPE STATUS (Flyttet til høyre med marginLeft: 'auto') */}
        <Text style={styles.sub}>Etapper: {legsCount}</Text>
      </View>

      {/* KART AREA */}
      <View style={styles.body}>
        <MapViewHybrid 
            currentStopIndex={currentStopIndex}
            currentLeg={currentLeg}
        />
      </View>
      
      {/* OVERLAYS FOR ANKOMST */}
      {arrivalVisible && (
        <ArrivalPoster
          stopName={arrivalName}
          onStartByquiz={() => { setArrivalVisible(false); setStopModuleVisible(true); }}
          onStart={() => { setArrivalVisible(false); setStopModuleVisible(true); }}
          buttonText="Start stopp-oppdrag"
        />
      )}

      {/* STOP MODUL */}
      <StopModule
        visible={stopModuleVisible}
        stopName={arrivalName}
        getStopQuiz={(name:string) => [] /* TODO: koble til ekte quizadapter senere */}
        onExit={() => setStopModuleVisible(false)}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  header: { 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderBottomWidth: StyleSheet.hairlineWidth, 
    borderBottomColor: "#ddd",
    flexDirection: 'row', 
    alignItems: 'center',
  },
  title: { fontSize: 18, fontWeight: "800" },
  // NYTT: Plasserer teksten helt til høyre
  sub: { marginTop: 2, color: "#666", marginLeft: 'auto' }, 
  body: { flex: 1 },
  // KNAPP STILER:
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#333', 
    marginRight: 10, 
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '700',
  }
});