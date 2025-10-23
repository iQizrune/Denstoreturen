// src/map/mapUtils.ts
// Hjelpefunksjoner for å konvertere RouteLegs til MapView Polyline-objekter.

import type { RouteLeg } from "@/src/types/route";

/**
 * Konverterer RouteLeg-stien til et array av koordinatobjekter som
 * MapView Polyline forventer.
 * @param legs Listen over rutesegmenter.
 * @returns Array av koordinater {latitude, longitude}
 */
export function getLegsAsPolyline(legs: RouteLeg[]) {
    return legs.flatMap(leg => 
        leg.path.map(([latitude, longitude]) => ({
            latitude,
            longitude,
        }))
    );
}

/**
 * Konverterer RouteLeg-stien til et array av koordinatobjekter for en spesifikk etappe.
 * Dette er nyttig for å tegne den aktive etappen separat.
 */
export function getLegPathForIndex(legs: RouteLeg[], index: number) {
    if (index < 0 || index >= legs.length) return [];
    
    return legs[index].path.map(([latitude, longitude]) => ({
        latitude,
        longitude,
    }));
}

/**
 * Beregner senterpunktet for en rute (enkel midtpunkt-beregning).
 */
export function getRouteCenter(legs: RouteLeg[]) {
    if (!legs.length || !legs[0].path.length) return { latitude: 61, longitude: 8 }; // Sentrum Norge fallback

    const coords = getLegsAsPolyline(legs);
    
    const avgLat = coords.reduce((sum, c) => sum + c.latitude, 0) / coords.length;
    const avgLng = coords.reduce((sum, c) => sum + c.longitude, 0) / coords.length;
    
    return { latitude: avgLat, longitude: avgLng };
}

