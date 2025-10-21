import type { RouteLeg } from "@/src/types/route";

/**
 * Leser assets/route/route-legs.json og normaliserer til RouteLeg[].
 * Tåler både { ROUTE_LEGS: [...] } og ren array, samt default-eksport.
 */
export function loadLegs(): RouteLeg[] {
  let raw: any = null;

  // Metro krever string-litteraler i require; vi prøver noen faste stier.
  try { raw = require("@/assets/route/route-legs.json"); } catch {}
  if (!raw) { try { raw = require("../../assets/route/route-legs.json"); } catch {} }
  if (!raw) { try { raw = require("../../../assets/route/route-legs.json"); } catch {} }
  if (!raw) { try { raw = require("@/assets/route/route-legs"); } catch {} } // uten .json i tilfelle

  const payload =
    (Array.isArray(raw?.ROUTE_LEGS) ? raw.ROUTE_LEGS :
     Array.isArray(raw?.default)    ? raw.default :
     Array.isArray(raw)             ? raw : []);

  const legs: RouteLeg[] = payload.map((l: any) => {
    const pathSrc = Array.isArray(l?.path) ? l.path : (Array.isArray(l?.points) ? l.points : []);
    const path = pathSrc
      .map((p: any) => [Number(p[0]), Number(p[1])] as [number, number])
      .filter((p: [number,number]) => Number.isFinite(p[0]) && Number.isFinite(p[1]));

    return {
      fromName: String(l?.fromName ?? l?.from ?? l?.start ?? ""),
      toName: String(l?.toName ?? l?.to ?? l?.end ?? ""),
      distanceMeters: Number(l?.distanceMeters ?? l?.distance_meters ?? l?.meters ?? l?.distance ?? 0) || 0,
      path,
    } as RouteLeg;
  }).filter((leg: RouteLeg) => leg.path.length > 1);

  return legs;
}
