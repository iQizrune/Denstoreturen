// app/kart.tsx
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { subscribeMeters } from "./lib/progressBus";
import { STOP_NAMES, STOP_CUM_METERS, STOP_COUNT } from "../src/data/stops";
import { ROUTE_NODES } from "../src/data/routeNodes";

type NodeInfo = { name: string; lat: number; lng: number };
const NODE = (slug: string): NodeInfo | null =>
  (ROUTE_NODES as any)?.[slug] ?? null;

// Finn etappe-indeks fra antall meter
function stageIndexFromMeters(m: number) {
  // mellom [i, i+1)
  const n = STOP_COUNT;
  if (n < 2) return 0;
  for (let i = 0; i < n - 1; i++) {
    const a = STOP_CUM_METERS[i];
    const b = STOP_CUM_METERS[i + 1];
    if (m >= a && m < b) return i;
  }
  return n - 2; // helt på slutten
}

export default function KartScreen() {
  const [meters, setMeters] = useState(0);

  // Lytt på fremdriftsbussen
  useEffect(() => {
  const unsubscribe = subscribeMeters(({ meters }) => setMeters(meters | 0));
  return () => { unsubscribe(); }; // sørger for void
}, []);


  // Beregn etappe + fremdrift
  const model = useMemo(() => {
    const idx = stageIndexFromMeters(meters);
    const fromSlug = STOP_NAMES[idx];
    const toSlug = STOP_NAMES[idx + 1];

    const fromCum = STOP_CUM_METERS[idx];
    const toCum = STOP_CUM_METERS[idx + 1];
    const legDistance = Math.max(0, toCum - fromCum);
    const legProgress = Math.min(Math.max(0, meters - fromCum), legDistance);

    const fromNode = NODE(fromSlug);
    const toNode = NODE(toSlug);

    return {
      idx,
      fromSlug,
      toSlug,
      fromNode,
      toNode,
      legDistance,
      legProgress,
      totalMeters: meters,
      totalToGoal: STOP_CUM_METERS[STOP_CUM_METERS.length - 1],
    };
  }, [meters]);

  return (
    <View style={s.container}>
      <Text style={s.h1}>Den store gåturen – Kart</Text>

      <Text style={s.row}>
        <Text style={s.label}>Gjeldende etappe: </Text>
        <Text style={s.value}>
          {model.fromNode?.name || model.fromSlug} → {model.toNode?.name || model.toSlug}
        </Text>
      </Text>

      <Text style={s.row}>
        <Text style={s.label}>Etappe #:</Text>
        <Text style={s.value}> {model.idx + 1} / {STOP_COUNT - 1}</Text>
      </Text>

      <Text style={s.row}>
        <Text style={s.label}>Etappe meter: </Text>
        <Text style={s.value}>
          {model.legProgress} / {model.legDistance} m
        </Text>
      </Text>

      <Text style={s.row}>
        <Text style={s.label}>Totalt: </Text>
        <Text style={s.value}>
          {model.totalMeters} / {model.totalToGoal} m
        </Text>
      </Text>

      {!!model.fromNode && !!model.toNode && (
        <View style={s.coordsBox}>
          <Text style={s.sub}>Koordinater</Text>
          <Text style={s.coords}>
            Fra: {model.fromNode.lat.toFixed(5)}, {model.fromNode.lng.toFixed(5)}
          </Text>
          <Text style={s.coords}>
            Til:  {model.toNode.lat.toFixed(5)}, {model.toNode.lng.toFixed(5)}
          </Text>
        </View>
      )}

      {/* Plassholder for senere: vi kan tegne polyline/mini-kart her når/om vi vil */}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8, backgroundColor: "#0b1220" },
  h1: { color: "#e5e7eb", fontSize: 20, fontWeight: "700", marginBottom: 8 },
  row: { color: "#cbd5e1", fontSize: 16 },
  label: { color: "#94a3b8", fontWeight: "600" },
  value: { color: "#e5e7eb", fontWeight: "600" },
  coordsBox: { marginTop: 12, padding: 12, borderRadius: 8, backgroundColor: "#1f2937" },
  sub: { color: "#93c5fd", fontWeight: "700", marginBottom: 6 },
  coords: { color: "#cbd5e1", fontSize: 14 },
});
