import React, { useMemo, useRef } from "react";
import { Platform, View, Text, TouchableOpacity } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useRouter } from "expo-router";

import * as StopsMod from "@/src/data/stops";
import * as RouteNodesMod from "@/src/data/routeNodes";

type LatLng = { latitude: number; longitude: number };
type Stop = { key?: string; name?: string; title?: string; lat: number; lng: number };

/** ---- Coercers to tolerate your current data shapes ---- **/

// routeNodes.ts exports a DICTIONARY: { "lindesnes-fyr": {name, lat, lng}, ... }
function coerceRouteDict(mod: any): Record<string, { lat: number; lng: number; name?: string; title?: string }> {
  const obj = (mod && (mod.ROUTE_NODES || mod.default || mod.nodes || mod.routeNodes)) || {};
  const dict: Record<string, { lat: number; lng: number; name?: string; title?: string }> = {};
  for (const k of Object.keys(obj)) {
    const v = (obj as any)[k] || {};
    const latRaw = v.latitude ?? v.lat;
    const lngRaw = v.longitude ?? v.lng ?? v.lon;
    if (latRaw != null && lngRaw != null) {
      dict[k] = { lat: Number(latRaw), lng: Number(lngRaw), name: v.name ?? v.title, title: v.title ?? v.name };
    }
  }
  return dict;
}

// stops.ts may export STOP_NAMES (array of slugs) and/or STOPS (objects)
function coerceStopOrder(mod: any): string[] {
  // Prefer STOP_NAMES if it exists (your audit shows this is present)
  if (Array.isArray(mod?.STOP_NAMES) && mod.STOP_NAMES.length) return [...mod.STOP_NAMES];
  // Else, try to derive slugs from STOPS if present
  const arr = (mod && (mod.STOPS || mod.default || mod.stops)) || [];
  const out: string[] = [];
  for (const s of arr as any[]) {
    // Try explicit slug key
    if (s.slug) { out.push(String(s.slug)); continue; }
    // Try name/title normalized
    const nm = String(s.name ?? s.title ?? "").trim().toLowerCase();
    if (nm) out.push(nm.replace(/\s+/g, "-"));
  }
  return out;
}

// If STOPS already carry lat/lng, we can use them directly
function coerceStopsWithCoords(mod: any): Stop[] {
  const arr = (mod && (mod.STOPS || mod.default || mod.stops)) || [];
  const out: Stop[] = [];
  for (const s of arr as any[]) {
    const latRaw = s.latitude ?? s.lat;
    const lngRaw = s.longitude ?? s.lng ?? s.lon;
    if (latRaw != null && lngRaw != null) {
      out.push({
        key: String(s.slug ?? s.name ?? s.title ?? ""),
        name: s.name ?? s.title,
        title: s.title ?? s.name,
        lat: Number(latRaw),
        lng: Number(lngRaw),
      });
    }
  }
  return out;
}

/** ---- Helpers ---- **/

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

/** ---- Screen ---- **/

export default function Kart() {
  const router = useRouter();

  // Web: show info only
  if (Platform.OS === "web") {
    const names = coerceStopOrder(StopsMod);
    return (
      <View style={{ flex: 1, backgroundColor: "#0b0b0f", padding: 16, gap: 12 }}>
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "600" }}>Kart (web-visning)</Text>
        <Text style={{ color: "#cfd3dc" }}>Interaktivt kart vises på mobil.</Text>
        <Text style={{ color: "#cfd3dc" }}>Antall stopp i data: {names.length || 0}</Text>
        <TouchableOpacity onPress={() => router.replace("/start")}>
          <Text style={{ color: "#9ad", fontSize: 16 }}>Til start</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Data: route dictionary + ordered stop slugs
  const routeDict = useMemo(() => coerceRouteDict(RouteNodesMod), []);
  const stopOrder = useMemo(() => coerceStopOrder(StopsMod), []);
  const stopsWithCoordsFromStops = useMemo(() => coerceStopsWithCoords(StopsMod), []);

  // Build stops with coordinates in the correct order:
  // 1) Prefer STOPS with embedded coords if they exist AND cover most of the list
  // 2) Else, map STOP_NAMES through routeDict keys (slug -> {lat,lng})
  const stops: Stop[] = useMemo(() => {
    if (stopsWithCoordsFromStops.length >= stopOrder.length * 0.8 && stopsWithCoordsFromStops.length > 0) {
      // If they already have coords, sort them following stopOrder if possible
      const byKey = new Map<string, Stop>();
      for (const s of stopsWithCoordsFromStops) {
        const key = (s.key ?? s.name ?? s.title ?? "").toString().trim().toLowerCase().replace(/\s+/g, "-");
        byKey.set(key, s);
      }
      const ordered: Stop[] = [];
      for (const slug of stopOrder) {
        const s = byKey.get(String(slug).toLowerCase());
        if (s) ordered.push(s);
      }
      // Add any remaining that weren’t matched (just in case)
      for (const s of stopsWithCoordsFromStops) {
        if (!ordered.includes(s)) ordered.push(s);
      }
      return ordered;
    }

    // Fallback: assemble from routeDict using STOP_NAMES in order
    const out: Stop[] = [];
    for (const slug of stopOrder) {
      const k = String(slug).toLowerCase();
      const entry = routeDict[k];
      if (entry) {
        out.push({ key: k, name: k, title: entry.title ?? entry.name ?? k, lat: entry.lat, lng: entry.lng });
      }
    }
    return out;
  }, [stopsWithCoordsFromStops, stopOrder, routeDict]);

  // Build line in the same order
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
            key={`${s.key ?? s.name ?? s.title ?? "stop"}-${idx}`}
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
