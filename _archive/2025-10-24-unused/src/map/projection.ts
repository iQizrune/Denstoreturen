// src/map/projection.ts
import type { RouteLeg } from "@/src/types/route";

/** Web Mercator (EPSG:3857) – normalisert [0..1] tile space */
const MAX_LAT = 85.05112878; // mercator cutoff

export function mercatorX(lng: number) {
  return (lng + 180) / 360; // 0..1
}

export function mercatorY(lat: number) {
  const φ = Math.max(Math.min(lat, MAX_LAT), -MAX_LAT) * Math.PI / 180;
  const y = Math.log(Math.tan(Math.PI / 4 + φ / 2));
  // web mercator normalized (0..1, y grows downward):
  return (1 - y / Math.PI) / 2;
}

export type Bounds = { minX:number; minY:number; maxX:number; maxY:number };
export type Viewport = { width:number; height:number; pad?:number };

export function legsBoundsProjected(legs: RouteLeg[]): Bounds {
  let minX=  1e9, minY=  1e9, maxX= -1e9, maxY= -1e9;
  for (const leg of legs) for (const [lat,lng] of leg.path) {
    const x = mercatorX(lng);
    const y = mercatorY(lat);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  if (!isFinite(minX)) { minX=0; minY=0; maxX=1; maxY=1; }
  return { minX, minY, maxX, maxY };
}

export function fitBoundsProjected(b: Bounds, vp: Viewport) {
  const pad = vp.pad ?? 0.04; // 4% visuell margin
  const dx = Math.max(b.maxX - b.minX, 1e-9);
  const dy = Math.max(b.maxY - b.minY, 1e-9);
  const scale = Math.min(
    vp.width  / (dx * (1 + pad*2)),
    vp.height / (dy * (1 + pad*2)),
  );
  const offX = b.minX - dx * pad;
  const offY = b.minY - dy * pad;
  return { scale, offX, offY };
}

/** Projiser ett punkt til pixel-koord i viewport */
export function projectPoint(lat:number, lng:number, vp:Viewport, scale:number, offX:number, offY:number) {
  const xN = mercatorX(lng);
  const yN = mercatorY(lat);
  const x = (xN - offX) * scale;
  const y = (yN - offY) * scale; // y er allerede “nedover” i mercator-normalisert
  return [x, y] as const;
}
