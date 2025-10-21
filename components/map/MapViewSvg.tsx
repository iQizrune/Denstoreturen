// components/map/MapViewSvg.tsx — proffere look (glow, labels, info-chip)
import * as React from "react";
import { useMemo, useRef, useState, useCallback } from "react";
import {
  View, Text as RNText, StyleSheet, LayoutChangeEvent,
  PanResponder, GestureResponderEvent, PanResponderGestureState, NativeTouchEvent
} from "react-native";
import Svg, { G, Path, Circle, Text as SvgText, Line } from "react-native-svg";
import type { RouteLeg } from "@/src/types/route";
import { legsBoundsProjected, fitBoundsProjected, projectPoint } from "@/src/map/projection";

type VP = { width:number; height:number; pad?:number };
type Stop = { id:string; name:string; lat:number; lng:number; index:number; at?:number };

export type MapViewSvgProps = {
  legs: RouteLeg[];
  initialActive?: number;
  currentLeg?: number;
  focusPad?: number;
  stops?: Stop[];
  currentStopIndex?: number;
  onLegPress?: (index:number)=>void;
};

// --- Tema (små justeringer gir mye) ---
const COLORS = {
  routeRed:   "#D32F2F",  // litt mer dempet rød
  routeBlue:  "#0B66D4",  // litt mørkere blå
  blueGlow:   "rgba(11,102,212,0.25)",
  stopRed:    "#C62828",
  stopBlue:   "#1565C0",
  labelText:  "#222",
  labelSel:   "#0D47A1",
};

// enkel dp-forenkling i pikselrom
function dpSimplify(points: readonly [number,number][], tol: number): [number,number][] {
  if (points.length <= 2) return points.slice() as [number,number][];
  const sqTol = tol*tol, keep = new Array(points.length).fill(false);
  keep[0] = keep[points.length-1] = true;
  const stack: [number, number][] = [[0, points.length-1]];
  function sqSeg(p:[number,number], a:[number,number], b:[number,number]){
    let x=a[0], y=a[1], dx=b[0]-x, dy=b[1]-y;
    if (dx||dy){ let t=((p[0]-x)*dx + (p[1]-y)*dy)/(dx*dx+dy*dy); t=Math.max(0,Math.min(1,t)); x+=t*dx; y+=t*dy; }
    const ux=p[0]-x, uy=p[1]-y; return ux*ux+uy*uy;
  }
  while (stack.length){
    const [f,l]=stack.pop()!, A=points[f], B=points[l];
    let idx=-1, max=0;
    for (let i=f+1;i<l;i++){ const d=sqSeg(points[i] as any, A as any, B as any); if (d>max){max=d;idx=i;} }
    if (max>sqTol && idx!==-1){ keep[idx]=true; stack.push([f,idx],[idx,l]); }
  }
  const out: [number,number][] = []; for (let i=0;i<points.length;i++) if (keep[i]) out.push(points[i] as any); return out;
}

export default function MapViewSvg({
  legs,
  initialActive = -1,
  currentLeg,
  focusPad = 0.15,
  stops,
  currentStopIndex,
  onLegPress,
}: MapViewSvgProps) {
  const [vp, setVp] = useState<VP>({ width: 0, height: 0, pad: 0.04 });
  const [active, setActive] = useState(initialActive);

  // Base fit + sentrering
  const bounds = useMemo(()=> legsBoundsProjected(legs), [legs]);
  const base   = useMemo(()=> fitBoundsProjected(bounds, vp), [bounds, vp]);
  const mx = (vp.width  - (bounds.maxX - bounds.minX) * base.scale * (1 + (vp.pad ?? 0) * 2)) / 2;
  const my = (vp.height - (bounds.maxY - bounds.minY) * base.scale * (1 + (vp.pad ?? 0) * 2)) / 2;

  const onLayout = useCallback((e:LayoutChangeEvent)=>{
    const { width, height } = e.nativeEvent.layout;
    if (width>0 && height>0) setVp(v => (v.width===width && v.height===height) ? v : ({...v, width, height}));
  },[]);

  // Pre-projisér legs -> pikselrom (sentrert)
  const projectedLegs = useMemo(()=>{
    if (vp.width===0 || vp.height===0) return [] as [number,number][][];
    return legs.map(leg => leg.path.map(([lat,lng]) => {
      const [x,y] = projectPoint(lat,lng,vp,base.scale,base.offX,base.offY);
      return [x+mx, y+my] as [number,number];
    }));
  }, [legs, vp, base, mx, my]);

  // Forenkle (ytelse) — lav tol => flere punkter
  const simplifiedLegs = useMemo(()=>{
    const tol = 0.4;
    return projectedLegs.map(points => dpSimplify(points, tol));
  }, [projectedLegs]);

  // Path-strenger pr. etappe (for rød-tegning)
  const simplifiedPaths = useMemo(()=>{
    return simplifiedLegs.map(leg => {
      if (!leg.length) return "";
      let d = `M${leg[0][0]},${leg[0][1]}`;
      for (let i=1;i<leg.length;i++) d += ` L${leg[i][0]},${leg[i][1]}`;
      return d;
    });
  }, [simplifiedLegs]);

  // Aktiv blå etappe bruker full detalj
  const aIdx = (active>=0 ? active : (typeof currentLeg==="number" ? currentLeg : -1));
  const activePath = useMemo(()=>{
    if (aIdx < 0 || aIdx >= projectedLegs.length) return "";
    const leg = projectedLegs[aIdx];
    if (!leg.length) return "";
    let d = `M${leg[0][0]},${leg[0][1]}`;
    for (let i=1;i<leg.length;i++) d += ` L${leg[i][0]},${leg[i][1]}`;
    return d;
  }, [projectedLegs, aIdx]);

  // === Smooth transform: current -> target (lerp i RAF) ===
  const gRef = useRef<any>(null);
  const markerRefs = useRef<any[]>([]);
  const markerPos  = useRef<{x:number; y:number}[]>([]);

  const currentT = useRef({ zoom: 1, tx: 0, ty: 0 });
  const targetT  = useRef({ zoom: 1, tx: 0, ty: 0 });
  const rafId    = useRef<number | null>(null);

  const clampZoom = (z:number)=> Math.max(0.5, Math.min(60, z)); // høyere maks
  const applyNow = () => {
    const { tx, ty, zoom } = currentT.current;
    gRef.current?.setNativeProps({ transform: [{ translateX: tx }, { translateY: ty }, { scale: zoom }] } as any);
    const inv = 1 / (zoom || 1);
    for (let i=0;i<markerRefs.current.length;i++){
      const m = markerRefs.current[i];
      const p = markerPos.current[i];
      if (!m || !p) continue;
      m.setNativeProps({ transform: [{ translateX: p.x }, { translateY: p.y }, { scale: inv }] } as any);
    }
  };

  const tick = () => {
    rafId.current = requestAnimationFrame(tick);
    const a = 0.14; // lerp-faktor
    const c = currentT.current, t = targetT.current;
    const dx = t.tx - c.tx, dy = t.ty - c.ty, dz = t.zoom - c.zoom;
    if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01 && Math.abs(dz) < 0.0005) {
      c.tx = t.tx; c.ty = t.ty; c.zoom = t.zoom;
      applyNow(); return;
    }
    c.tx += dx * a; c.ty += dy * a; c.zoom += dz * a;
    applyNow();
  };

  React.useEffect(() => {
    rafId.current = requestAnimationFrame(tick);
    return () => { if (rafId.current!=null) cancelAnimationFrame(rafId.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pan/pinch (rolig respons)
  const panRef = useRef({ startTx:0, startTy:0, lastTap:0 });
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (e, g) => g.dx*g.dx + g.dy*g.dy > 4,
      onMoveShouldSetPanResponder:  (e, g) => g.dx*g.dx + g.dy*g.dy > 4,
      onPanResponderGrant: () => {
        const now = Date.now();
        if (now - panRef.current.lastTap < 250) {
          targetT.current = { zoom: 1, tx: 0, ty: 0 };
          panRef.current.lastTap = 0; return;
        }
        panRef.current.lastTap = now;
        panRef.current.startTx = targetT.current.tx;
        panRef.current.startTy = targetT.current.ty;
      },
      onPanResponderMove: (_e, g: PanResponderGestureState) => {
        const sens = 0.85;
        targetT.current.tx = panRef.current.startTx + g.dx * sens;
        targetT.current.ty = panRef.current.startTy + g.dy * sens;
      },
    })
  ).current;

  function dist2(a: NativeTouchEvent, b: NativeTouchEvent){ const dx=a.pageX-b.pageX, dy=a.pageY-b.pageY; return Math.hypot(dx,dy); }
  function centroid(a: NativeTouchEvent, b: NativeTouchEvent){ return { cx:(a.pageX+b.pageX)/2, cy:(a.pageY+b.pageY)/2 }; }
  const pinchRef = useRef({ pinching:false, startZoom:1, startDist:1, startTx:0, startTy:0, startCx:0, startCy:0 });

  const onTouchStart = (e: GestureResponderEvent) => {
    const ts = e.nativeEvent.touches;
    if (ts.length === 2) {
      pinchRef.current.pinching = true;
      pinchRef.current.startZoom = targetT.current.zoom;
      pinchRef.current.startDist = dist2(ts[0], ts[1]);
      const { cx, cy } = centroid(ts[0], ts[1]);
      pinchRef.current.startCx = cx; pinchRef.current.startCy = cy;
      pinchRef.current.startTx = targetT.current.tx; pinchRef.current.startTy = targetT.current.ty;
    }
  };
  const onTouchMove = (e: GestureResponderEvent) => {
    const ts = e.nativeEvent.touches;
    if (pinchRef.current.pinching && ts.length === 2) {
      const d  = dist2(ts[0], ts[1]) || 1;
      const rawScale = d / (pinchRef.current.startDist || 1);
      const eased    = Math.pow(rawScale, 0.85);
      const nz = clampZoom(pinchRef.current.startZoom * eased);
      const zx = nz / (pinchRef.current.startZoom || 1);
      const { cx, cy } = centroid(ts[0], ts[1]);
      targetT.current.zoom = nz;
      targetT.current.tx   = cx - (cx - pinchRef.current.startTx) * zx;
      targetT.current.ty   = cy - (cy - pinchRef.current.startTy) * zx;
    }
  };
  const onTouchEnd = (e: GestureResponderEvent) => { if (e.nativeEvent.touches.length < 2) pinchRef.current.pinching = false; };

  // Klikk på etappe
  const onPressLeg = (i:number) => { setActive(i); onLegPress?.(i); };

  // --- Fokus ved start: currentLeg > currentStopIndex ---
  React.useEffect(() => {
    if (vp.width===0 || vp.height===0) return;

    const idx = (typeof currentLeg === "number" && currentLeg >= 0 && currentLeg < simplifiedLegs.length) ? currentLeg : -1;
    if (idx >= 0) {
      const pts = simplifiedLegs[idx];
      if (!pts || pts.length===0) return;
      let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
      for (const [x,y] of pts){ if (x<minX) minX=x; if (x>maxX) maxX=x; if (y<minY) minY=y; if (y>maxY) maxY=y; }
      const pad = Math.max(0, Math.min(0.4, focusPad));
      const dx = Math.max(1, maxX - minX), dy = Math.max(1, maxY - minY);
      const baseZoom = Math.min(vp.width/(dx*(1+pad*2)), vp.height/(dy*(1+pad*2)));
      const boost = 3.2; // litt tettere
      const zoom = clampZoom(baseZoom * boost);
      const cx = (minX+maxX)/2, cy=(minY+maxY)/2;
      targetT.current = { zoom, tx: vp.width/2 - cx*zoom, ty: vp.height/2 - cy*zoom };
      setActive(idx);
      return;
    }

    if (typeof currentStopIndex === "number" && stops && stops[currentStopIndex]) {
      const s = stops[currentStopIndex];
      const [px,py] = projectPoint(s.lat, s.lng, vp, base.scale, base.offX, base.offY);
      const x = px + mx, y = py + my;
      const zoom = 12;
      targetT.current = { zoom: clampZoom(zoom), tx: vp.width/2 - x*zoom, ty: vp.height/2 - y*zoom };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vp.width, vp.height, simplifiedLegs, currentLeg, currentStopIndex, stops, focusPad]);

  // Markører + labels (konstant skjermstørrelse)
  const markerRadius = 4;
  const stopNodes = useMemo(() => {
    markerRefs.current = [];
    markerPos.current = [];
    if (!stops || stops.length===0 || vp.width===0 || vp.height===0) return null;
    return stops.map((s, i) => {
      const [px,py] = projectPoint(s.lat, s.lng, vp, base.scale, base.offX, base.offY);
      const x = px + mx, y = py + my;
      markerPos.current[i] = { x, y };
      const isCurrent = typeof currentStopIndex === "number" && currentStopIndex === i;
      const fill = isCurrent ? COLORS.stopBlue : COLORS.stopRed;
      const labelFill = isCurrent ? COLORS.labelSel : COLORS.labelText;
      const fontW = isCurrent ? "700" : "600";

      return (
        <G key={s.id} ref={(el)=>{ markerRefs.current[i]=el; }}>
          <Circle cx={0} cy={0} r={markerRadius} fill={fill} stroke="#fff" strokeWidth={1.5} />
          {/* liten 'lederlinje' for å separere prikk/tekst tett zoom */}
          <Line x1={2} y1={-2} x2={6} y2={-6} stroke="#fff" strokeWidth={2} />
          <Line x1={2} y1={-2} x2={6} y2={-6} stroke="rgba(0,0,0,0.35)" strokeWidth={1} />
          {/* label med hvit halo + tekst */}
          <SvgText x={10} y={-8} fontSize={11} stroke="#fff" strokeWidth={3} fontWeight={fontW as any}>{s.name}</SvgText>
          <SvgText x={10} y={-8} fontSize={11} fill={labelFill} fontWeight={fontW as any}>{s.name}</SvgText>
        </G>
      );
    });
  }, [stops, currentStopIndex, vp, base, mx, my]);

  // Første render: sikre at transform brukes
  React.useEffect(() => { applyNow(); }, []);

  // Distanse for aktiv etappe (HUD)
  const activeInfo = aIdx>=0 && aIdx<legs.length ? legs[aIdx] : null;
  const distKm = activeInfo ? (activeInfo.distanceMeters/1000).toFixed(1) : null;

  return (
    <View style={styles.root} onLayout={onLayout}>
      {vp.width>0 && vp.height>0 ? (
        <>
          <Svg width="100%" height="100%">
            <G ref={gRef as any}>
              {/* Røde etapper: alle unntatt aktiv */}
              {simplifiedPaths.map((d,i) =>
                (d && i !== aIdx) ? (
                  <Path
                    key={`leg-${i}`}
                    d={d}
                    fill="none"
                    stroke={COLORS.routeRed}
                    strokeWidth={2.5}
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : null
              )}

              {/* Blå aktiv etappe (glow + stroke, full detalj) */}
              {activePath ? (
                <>
                  <Path
                    d={activePath}
                    fill="none"
                    stroke={COLORS.blueGlow}
                    strokeWidth={8}
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d={activePath}
                    fill="none"
                    stroke={COLORS.routeBlue}
                    strokeWidth={4}
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              ) : null}

              {/* Markører + labels */}
              {stopNodes}

              {/* Hit-paths for trykk på etappe */}
              {simplifiedLegs.map((leg,i)=>(
                leg.length ? <Path key={`hit-${i}`} d={`M${leg[0][0]},${leg[0][1]} L${leg.slice(1).map(p=>`${p[0]},${p[1]}`).join(" L")}`} fill="none" stroke="transparent" strokeWidth={18} vectorEffect="non-scaling-stroke" onPress={()=>onLegPress?.(i)} /> : null
              ))}
            </G>
          </Svg>

          {/* Gest-område */}
          <View
            style={StyleSheet.absoluteFill}
            pointerEvents="auto"
            {...panResponder.panHandlers}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onTouchCancel={onTouchEnd}
          />
        </>
      ) : null}

      {/* Info-chip oppe til høyre */}
      {activeInfo ? (
        <View style={styles.chip}>
          <RNText style={styles.chipTitle} numberOfLines={1}>
            {activeInfo.fromName} → {activeInfo.toName}
          </RNText>
          <RNText style={styles.chipSub}>{distKm} km</RNText>
        </View>
      ) : null}

      {/* Debug HUD nederst (kan slåes av om ønskelig) */}
      <View style={styles.hud} pointerEvents="none">
        <RNText style={styles.hudText}>
          etapper: {legs.length} • aktiv: {aIdx>=0?aIdx+1:"-"} ({aIdx>=0 ? legs[aIdx]?.path?.length ?? 0 : 0} pts) • {vp.width}×{vp.height}
        </RNText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f5f5f5" },
  chip: {
    position: "absolute",
    right: 10, top: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 10, paddingVertical: 8,
    borderRadius: 10,
    shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
    minWidth: 120, maxWidth: "76%",
  },
  chipTitle: { fontWeight: "700", color: "#111" },
  chipSub:   { marginTop: 2, fontWeight: "600", color: "#444", fontSize: 12 },
  hud: {
    position: "absolute",
    left: 8, bottom: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8, paddingVertical: 6,
    borderRadius: 8,
  },
  hudText: { color: "#fff", fontWeight: "600" },
});
