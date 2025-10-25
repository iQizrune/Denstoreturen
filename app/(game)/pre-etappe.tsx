// app/(game)/pre-etappe.tsx

import React from "react";
import { SafeAreaView, View, StyleSheet } from "react-native";
import { router } from "expo-router";

import { getStops, getRouteState } from "@/src/state/route";
import StagePoster from "@/components/posters/StagePoster";

export default function PreEtappe() {
  // Avled neste etappe fra rute-state
  const rs = getRouteState();
  const stops = getStops();
  const etappeNo = rs?.nextIndex ?? 1;

  const fromName =
    stops[Math.max(0, etappeNo - 1)]?.name ?? "Start";
  const toName =
    stops[etappeNo]?.name ?? "Mål";
  const legMeters = Math.max(
    0,
    (stops[etappeNo]?.at ?? 0) - (stops[Math.max(0, etappeNo - 1)]?.at ?? 0)
  );

  // Start etappe → gå til /play
  const startEtappe = () => {
    router.replace("/play");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <StagePoster
          visible={true}
          fromName={fromName}
          toName={toName}
          meters={legMeters}
          etappeNo={etappeNo}
          onStart={startEtappe}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B0B0E" },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
});
