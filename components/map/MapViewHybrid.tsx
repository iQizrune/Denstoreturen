// components/map/MapViewHybrid.tsx
// Hybridkart som kombinerer MapView-bakgrunn med Polyline-segmentering for hele ruten.
// Løser RangeError ved å tegne ruten per etappesegment og fikser TS-feil.

import React, { useMemo, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";

// Imports fra prosjektets logikk
import { loadLegs } from "@/src/route/legsFromJson";
import { getRouteCenter, getLegsAsPolyline, getLegPathForIndex } from "@/src/map/mapUtils";
import { STOP_NAMES } from "@/src/data/stops"; 
import type { RouteLeg } from "@/src/types/route";

// --- TEMA OG STIL ---
const COLORS = {
  routeRed:   "#D32F2F",  // Fullført/Inaktiv rute
  routeBlue:  "#0B66D4",  // Aktiv rute
  stopRed:    "#C62828",  // Stopp
  stopBlue:   "#1565C0",  // Nåværende stopp
};

export type MapViewHybridProps = {
  currentLeg?: number;
  currentStopIndex?: number;
};

// --- MARKØR KOMPONENT ---
// Bruker MapView sin innebygde Marker
const StopMarker = ({ coordinate, title, isCurrent }: { coordinate: any, title: string, isCurrent: boolean }) => (
  <Marker
    coordinate={coordinate}
    title={title}
    pinColor={isCurrent ? COLORS.stopBlue : COLORS.stopRed}
  />
);

// --- HOVEDKOMPONENT ---
export default function MapViewHybrid({ currentLeg = 0, currentStopIndex = 0 }: MapViewHybridProps) {
  // Laster hele ruten (RouteLeg[]) kun én gang
  const LEGS: RouteLeg[] = useMemo(loadLegs, []);
  
  // Beregn senter og initial visning
  const initialRegion = useMemo(() => {
    const center = getRouteCenter(LEGS);
    return {
      latitude: center.latitude,
      longitude: center.longitude,
      // Justerer zoom for å se Norge (kan optimaliseres)
      latitudeDelta: 10, 
      longitudeDelta: 10,
    };
  }, [LEGS]);

  // Henter alle koordinatene for alle stopp (basert på LEGS-data)
  const STOPS_COORDS = useMemo(() => {
      // Vi bruker første punkt i hver leg som stoppested, pluss siste punkt i siste leg
      const stops = LEGS.map((leg, index) => {
          const coord = leg.path[0];
          if (!coord) return null;

          return {
              name: leg.fromName,
              coordinate: { latitude: coord[0], longitude: coord[1] },
              isCurrent: index === currentStopIndex,
              index: index,
          };
      }).filter(s => s !== null) as { name: string, coordinate: { latitude: number, longitude: number }, isCurrent: boolean, index: number }[];

      // Legg til sluttpunktet for siste etappe (Sikret mot undefined)
      if (LEGS.length > 0) {
          const lastLeg = LEGS.at(-1);
          const lastCoord = lastLeg?.path?.at(-1); // Bruker optional chaining for sikkerhet

          if (lastLeg && lastCoord) { 
              stops.push({
                  name: lastLeg.toName,
                  coordinate: { latitude: lastCoord[0], longitude: lastCoord[1] },
                  isCurrent: stops.length === currentStopIndex, // Markerer siste stopp
                  index: stops.length,
              });
          }
      }
      return stops;
  }, [LEGS, currentStopIndex]);


  // --- RENDER ---
  if (!LEGS.length) {
    return <View style={styles.container}><Text style={styles.loadingText}>Laster kartdata...</Text></View>;
  }

  return (
    <MapView
      style={StyleSheet.absoluteFill}
      initialRegion={initialRegion}
      // Fjerner standard MapView-etiketter for å unngå krasj med egne SVG/tekstetiketter
      customMapStyle={mapStyleNoLabels} 
    >
      {/* 1. Tegn ALLE etappene som SEGMENTER (løsning for RangeError) */}
      {LEGS.map((leg, index) => {
          const isActive = index === currentLeg;
          const legPath = getLegPathForIndex(LEGS, index);

          // Tegn den aktive etappen som en tykkere BLÅ linje
          if (isActive) {
              return (
                  <Polyline
                      key={`active-leg-${index}`}
                      coordinates={legPath}
                      strokeWidth={5}
                      strokeColor={COLORS.routeBlue}
                      lineJoin="round"
                      lineCap="round"
                  />
              );
          }
          
          // Tegn fullførte/inaktive etapper som tynnere RØD linje
          return (
              <Polyline
                  key={`inactive-leg-${index}`}
                  coordinates={legPath}
                  strokeWidth={2}
                  strokeColor={COLORS.routeRed}
                  lineJoin="round"
                  lineCap="round"
              />
          );
      })}

      {/* 2. Markører for Stoppesteder */}
      {STOPS_COORDS.map((s) => (
        <StopMarker
          key={s.name + s.index}
          coordinate={s.coordinate}
          title={s.name}
          isCurrent={s.isCurrent}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#ccc' },
});


// Stil for å fjerne MapView-etiketter (for å unngå kollisjon)
const mapStyleNoLabels = [
  {
    featureType: "poi",
    elementType: "labels.text",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#555555" }],
  },
];
