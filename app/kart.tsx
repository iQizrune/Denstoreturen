import { getOrderedStops } from "@/src/route/stopsFromData";
import { useCurrentStopIndex } from "@/src/hooks/useCurrentStopIndex";
import * as React from "react";
import { SafeAreaView, View, Text, StyleSheet } from "react-native";
import MapViewSvg from "@/components/map/MapViewSvg";
import type { RouteLeg } from "@/src/types/route";
import { loadLegs } from "@/src/route/legsFromJson";
import ArrivalPoster from "@/components/posters/ArrivalPoster";
import StopModule from "../src/partials/StopModule";
import { STOP_NAMES } from "@/src/data/stops";
import { useArrivedStop } from "@/src/hooks/useArrivedStop";



// Les JSON lokalt og normaliser
// (bruk require for å unngå tsconfig resolveJsonModule-krav)

export default function KartSvgScreen() {
  const LEGS = loadLegs();
    console.log("[kart] legs loaded:", LEGS.length, "firstLegPts:", LEGS[0]?.path?.length || 0);
  const STOPS = getOrderedStops(LEGS);
  const [currentLeg, setCurrentLeg] = React.useState<number>(-1);
const [arrivalVisible, setArrivalVisible] = React.useState(false);
const [arrivalName, setArrivalName] = React.useState<string>("");
const [stopModuleVisible, setStopModuleVisible] = React.useState(false);


  const currentStopIndex = useCurrentStopIndex(0);
useArrivedStop(({ index }) => {
  // Fokuser kartet på ny etappe: etappen som starter ved dette stoppet
  setCurrentLeg(Math.min(index, LEGS.length - 1));
  setArrivalName(STOP_NAMES[index] || "");
  setArrivalVisible(true);
});

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Kart (SVG)</Text>
        <Text style={styles.sub}>Etapper: {LEGS.length}</Text>
      </View>
      <View style={styles.body}>
        <MapViewSvg legs={LEGS} 
  stops={STOPS}
  currentStopIndex={currentStopIndex}
  focusPad={0.02}
  initialActive={0}
  currentLeg={currentLeg}
/>
      {/* Ankomst-plakat (vises når vi når et nytt stopp) */}
{arrivalVisible && (
  <ArrivalPoster
    stopName={arrivalName}
    onStartByquiz={() => { setArrivalVisible(false); setStopModuleVisible(true); }}
    onStart={() => { setArrivalVisible(false); setStopModuleVisible(true); }}
    buttonText="Start stopp-oppdrag"
  />
)}

{/* Stopp-oppdrag (enkel, med tom quiz som fallback) */}
<StopModule
  visible={stopModuleVisible}
  stopName={arrivalName}
  getStopQuiz={(name:string) => [] /* TODO: koble til ekte quizadapter senere */}
  onExit={() => setStopModuleVisible(false)}
/>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  header: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#ddd" },
  title: { fontSize: 18, fontWeight: "800" },
  sub: { marginTop: 2, color: "#666" },
  body: { flex: 1 },
});
