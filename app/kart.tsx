import React, { useMemo, useRef } from "react";
import { Platform, View, Text, TouchableOpacity } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useRouter } from "expo-router";

import * as Stops from "@/src/data/stops";

type LatLng = { latitude: number; longitude: number };
type Stop = { name?: string; title?: string; lat: number; lng: number };

function coerceStops(mod: any): Stop[] {
  const arr = (mod && (mod.STOPS || mod.default || mod.stops)) || [];
  return (arr as any[]).map((s: any) => ({
    name: s.name ?? s.title,
    title: s.title ?? s.name,
    lat: Number(s.lat),
    lng: Number(s.lng),
  }));
}

function regionFromCoords(coords: LatLng[]) {
  if (!coords.length) {
    return { latitude: 65, longitude: 13, latitudeDelta: 18, longitudeDelta: 12 };
  }
  const lats = coords.map((n) => n.latitude);
  const lngs = coords.map((n) => n.longitude);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(0.2, (maxLat - minLat) * 1.3),
    longitudeDelta: Math.max(0.2, (maxLng - minLng) * 1.3),
  };
}

export default function Kart() {
  const router = useRouter();

  // Web: bare info
  if (Platform.OS === "web") {
    const stops = coerceStops(Stops);
    return (
      <View style={{ flex: 1, backgroundColor: "#0b0b0f", padding: 16, gap: 12 }}>
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "600" }}>Kart (web-visning)</Text>
        <Text style={{ color: "#cfd3dc" }}>Interaktivt kart vises på mobil.</Text>
        <Text style={{ color: "#cfd3dc" }}>Antall stopp i data: {stops.length || 0}</Text>
        <TouchableOpacity onPress={() => router.replace("/start")}>
          <Text style={{ color: "#9ad", fontSize: 16 }}>Til start</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const stops = useMemo(() => coerceStops(Stops), []);
  const line: LatLng[] = useMemo(
    () => stops.map((s) => ({ latitude: s.lat, longitude: s.lng })),
    [stops]
  );
  const initialRegion = useMemo(() => regionFromCoords(line), [line]);
  const mapRef = useRef<MapView | null>(null);

  const fitAll = () => {
    if (!mapRef.current || !line.length) return;
    mapRef.current.fitToCoordinates(line, {
      edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
      animated: true,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={initialRegion}
        onMapReady={fitAll}
      >
        {line.length > 0 && <Polyline coordinates={line} strokeWidth={4} />}
        {stops.map((s, idx) => (
          <Marker
            key={`${s.name ?? s.title ?? "stop"}-${idx}`}
            coordinate={{ latitude: s.lat, longitude: s.lng }}
            title={s.title ?? s.name ?? `Stopp ${idx + 1}`}
            description={s.name ?? s.title ?? undefined}
          />
        ))}
      </MapView>

      <View
        pointerEvents="box-none"
        style={{ position: "absolute", top: 20, right: 16, left: 16, gap: 10 }}
      >
        <View
          style={{ alignSelf: "flex-end", backgroundColor: "rgba(0,0,0,0.5)", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 }}
        >
          <TouchableOpacity onPress={fitAll}>
            <Text style={{ color: "#fff", fontSize: 14 }}>Tilpass utsnitt</Text>
          </TouchableOpacity>
        </View>

        <View
          style={{ alignSelf: "flex-start", backgroundColor: "rgba(0,0,0,0.5)", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 }}
        >
          <TouchableOpacity onPress={() => router.replace("/start")}>
            <Text style={{ color: "#fff", fontSize: 14 }}>Til start</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
