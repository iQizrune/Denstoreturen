// src/partials/PlayingPanels_pauseable.tsx
// Basert på dagens PlayingPanels, men med "Pause etter dette spørsmålet" + pause-plakat.
// Endrer ikke eksisterende filer; du bytter bare import i app/play.tsx for å teste.

import * as React from "react";
import { useMemo, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Platform,
  useWindowDimensions,
  Animated,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { categoryFor } from "@/src/lib/sequencePlan";
import { buildQuizPool } from "@/src/banks/buildQuizPool";
import { FLAGS_ASSETS } from "@/src/banks/flagsAssets";
import { REVEAL_ASSETS } from "@/src/banks/revealAssets";
import { addMeters, getTotalMeters } from "@/src/state/run";
import TimeBar from "@/src/partials/TimeBar";
import { publishMeters, subscribeMeters } from "@/src/lib/progressBus";
import { mineTingStore } from "@/src/features/mine-ting/mineTingStore";
import { recordAnswer } from "@/components/bag/statsStore";
import { __STATS_MODULE_ID } from "@/components/bag/statsStore";





const DEBUG = false;
const HEADER_ESTIMATE = 96;
const BOTTOM_ESTIMATE = 40;
const SEED = "runde-1";
const AUTONEXT_MS = 650;
const REVEAL_MS = 10000;
const LIGHTNING_MS = 15000;
const CORE_MS = 6000;
const EXTRALIFE_MS = 3000;
const PAUSE_BONUS_MS = 4000;

type QAOption = { id: string; label: string; isCorrect?: boolean };
type QA = {
  id: string;
  text: string;
  options: QAOption[];
  correctId?: string;
  image?: any;
  meta?: any;
};

export default function PlayingPanelsPauseable({ roundSeed = 0 }: { roundSeed?: number }) {

  useEffect(() => {
    mineTingStore.setDisabled(true);
    return () => { mineTingStore.setDisabled(false); };
  }, []);
  const insets = useSafeAreaInsets();
  const { height: winH } = useWindowDimensions();
  const padTop = Math.round(insets.top + HEADER_ESTIMATE);
  const padBottom = Math.round(insets.bottom + BOTTOM_ESTIMATE);

  const queue = useMemo<QA[]>(() => {
    const managed = buildQuizPool({
      enabled: { core: true, flags: true, trick: true, bonus: true, reveal: true, lightning: true, extralife: true },
      weights: { core: 3, flags: 2, trick: 1, bonus: 1, reveal: 1, lightning: 1, extralife: 1 },
      maxTotal: 300,
      seed: SEED,
      shuffleOptions: true,
    });

    const base: QA[] = managed.map((q: any) => ({
      id: q.id,
      text: q.text,
      options: q.options.map((o: any) => ({ id: o.id, label: o.label, isCorrect: q?.correctId === o?.id })),
      correctId: q.correctId,
      meta: q.meta || {},
      image: q.image,
    }));
    if (!base.length) return [];

    const pools: Record<string, QA[]> = { core: [], flags: [], bonus: [], reveal: [], trick: [], lightning: [], extralife: [] };
    for (const q of base) {
      const kind = (q?.meta?.kind as string) || "core";
      (pools[kind] ?? pools.core).push(q);
    }
    const idx: Record<string, number> = { core: 0, flags: 0, bonus: 0, reveal: 0, trick: 0, lightning: 0, extralife: 0 };

    const take = (kind: string): QA | null => {
      const p = pools[kind];
      if (!p || idx[kind] >= p.length) return null;
      const item = p[idx[kind]];
      idx[kind] += 1;
      return item;
    };
    const takeFallback = (): QA | null => {
      for (const k of ["core", "flags", "bonus", "reveal", "trick", "lightning", "extralife"]) {
        const got = take(k);
        if (got) return got;
      }
      return null;
    };

    const out: QA[] = [];
    for (let i = 1; i <= base.length; i++) {
      const picked = take(categoryFor(i)) || takeFallback();
      if (picked) out.push(picked);
      else break;
    }
    return out;
  }, [roundSeed]);

  const [i, setI] = useState(0);
  const [locked, setLocked] = useState(false);
  const [chosen, setChosen] = useState<string | null>(null);
  const [meters, setMeters] = useState(getTotalMeters());

  const [pauseAfterThis, setPauseAfterThis] = useState(false);
  const [showPause, setShowPause] = useState(false);
  const [extraMs, setExtraMs] = useState(0); // ekstra tid for dette spørsmålet

  const nextTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealFade = useRef(new Animated.Value(0)).current;
  const revealStartAt = useRef<number>(0);
  const lightningEndAt = useRef<number | null>(null);

  const q = queue[i];

  useEffect(() => {
    setChosen(null);
    setLocked(false);
    setPauseAfterThis(false);
    setShowPause(false);
    setExtraMs(0);
    if (nextTimer.current) { clearTimeout(nextTimer.current); nextTimer.current = null; }

    const avdekkingPath = (q as any)?.avdekking ?? (q as any)?.meta?.avdekking ?? "";
    const isReveal = typeof avdekkingPath === "string" && avdekkingPath.length > 0;
    const isLightning = (q?.meta?.kind as string) === "lightning";

    if (isReveal) {
      revealStartAt.current = Date.now();
      revealFade.setValue(1);
      Animated.timing(revealFade, { toValue: 0, duration: REVEAL_MS, useNativeDriver: true }).start();
    } else {
      revealFade.setValue(0);
      revealStartAt.current = 0;
    }

    if (isLightning) {
      const now = Date.now();
      if (!lightningEndAt.current || lightningEndAt.current <= now) {
        lightningEndAt.current = now + LIGHTNING_MS;
      }
    } else {
      lightningEndAt.current = null;
    }
  }, [q?.id, revealFade]);

  useEffect(() => {
    return () => { if (nextTimer.current) { clearTimeout(nextTimer.current); nextTimer.current = null; } };
  }, []);

  useEffect(() => {
    const unsub = subscribeMeters(({ meters }) => setMeters(meters));
    return unsub;
  }, []);

  if (!queue.length) {
    return (
      <View style={[styles.center, { paddingTop: padTop, paddingBottom: padBottom }]}>
        <Text style={styles.empty}>Ingen spørsmål tilgjengelig.</Text>
        <Text style={styles.hint}>Sjekk at minst én kategori er aktiv og at assets er på plass.</Text>
      </View>
    );
  }

  if (i >= queue.length || !q) {
    return (
      <View style={[styles.center, { paddingTop: padTop, paddingBottom: padBottom }]}>
        <Text style={styles.title}>Runde ferdig</Text>
        <Text style={styles.sub}>Meter: {meters} m</Text>
      </View>
    );
  }

  function onNext() {
    if (i + 1 < queue.length) {
      setI(i + 1);
      setChosen(null);
      setLocked(false);
    } else {
      setI(i + 1);
    }
  }

  function onChoose(opt: QAOption) {
    if (locked) return;
    setChosen(opt.id);

    const kind = (q?.meta?.kind as string) || "core";
    const isCorrect = !!(q?.correctId && opt.id === q.correctId);
    recordAnswer(isCorrect);

    let delta = 0;

    if (kind === "core" || kind === "flags") {
      delta = isCorrect ? 10 : 0;
    } else if (kind === "bonus") {
      const d = (q?.meta?.difficulty || (q?.meta?.level ?? "easy")).toString().toLowerCase();
      const bonusMap: Record<string, number> = { easy: 10, medium: 50, hard: 100 };
      delta = isCorrect ? (bonusMap[d] ?? 10) : 0;
    } else if (kind === "lightning") {
      delta = isCorrect ? 20 : 0;
    } else if (kind === "reveal") {
      if (isCorrect) {
        const elapsedMs = revealStartAt.current ? Date.now() - revealStartAt.current : REVEAL_MS;
        const remainingSec = Math.max(0, Math.ceil((REVEAL_MS - elapsedMs) / 1000));
        delta = remainingSec * 20;
      } else {
        delta = 0;
      }
    } else if (kind === "trick") {
      delta = isCorrect ? 0 : -100;
    } else if (kind === "extralife") {
      delta = 0;
    }

    if (delta !== 0) {
      addMeters(delta);
      const total = getTotalMeters();
      setTimeout(() => publishMeters(total), 0);
      setMeters(total);
    }

    setLocked(true);

    if (nextTimer.current) clearTimeout(nextTimer.current);
    nextTimer.current = setTimeout(() => {
      if (pauseAfterThis) {
        setShowPause(true);
      } else {
        onNext();
      }
    }, AUTONEXT_MS);
  }

  const code = (q as any)?.meta?.code ?? (q as any)?.meta?.key ?? (q as any)?.code ?? "";
  const assetFromCode = typeof code === "string" ? FLAGS_ASSETS[(code as string).toLowerCase()] : undefined;

  const avdekkingPath = (q as any)?.avdekking ?? (q as any)?.meta?.avdekking ?? "";
  const avKey = typeof avdekkingPath === "string"
    ? avdekkingPath.split("/").pop()?.replace(/\.(png|jpg|jpeg)$/i, "")?.toLowerCase()
    : "";
  const revealAsset = avKey ? REVEAL_ASSETS[avKey] : undefined;

  const displayImage = revealAsset || q?.image || assetFromCode || null;

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { paddingTop: padTop, paddingBottom: padBottom, minHeight: winH },
      ]}
      contentInsetAdjustmentBehavior="always"
      overScrollMode={Platform.OS === "android" ? "always" : "auto"}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.meters}>Meter: {meters} m</Text>
      {(() => {
        const kind = (q?.meta?.kind as string) || "core";
        const DUR: Record<string, number> = {
          core: CORE_MS,
          flags: CORE_MS,
          bonus: CORE_MS,
          lightning: LIGHTNING_MS,
          extralife: EXTRALIFE_MS,
          reveal: REVEAL_MS,
          trick: CORE_MS,
        };
        let durationMs = DUR[kind] ?? CORE_MS;
        if (kind === "lightning" && lightningEndAt.current) {
          durationMs = Math.max(0, lightningEndAt.current - Date.now());
        } else {
          durationMs += extraMs;
        }
        return (
          <TimeBar
            key={kind === "lightning" ? "lightning-session" : q.id}
            durationMs={durationMs}
            paused={kind === "lightning" ? false : locked}
            height={6}
            trackColor="#222"
            barColor={kind === "reveal" ? "#F39C12" : kind === "lightning" ? "#E74C3C" : "#27AE60"}
            onElapsed={() => {
              if ((q?.meta?.kind as string) === "lightning") {
                lightningEndAt.current = null;
                onNext();
              } else {
                onNext();
              }
            }}
          />
        );
      })()}

      <Text style={styles.question}>{q.text}</Text>

      {displayImage ? (
        <View style={styles.imageWrap}>
          <Image source={displayImage} style={styles.flag} resizeMode="contain" accessible />
          <Animated.View pointerEvents="none" style={[styles.flagOverlay, { opacity: revealFade }]}>
            <Image source={displayImage} style={styles.flag} resizeMode="contain" blurRadius={30} />
          </Animated.View>
        </View>
      ) : null}

      {/* PAUSE-KNAPPEN (kun for dette spørsmålet) */}
      <Pressable
        onPress={() => {
          if (!pauseAfterThis) {
            setPauseAfterThis(true);
            setExtraMs((t) => t + PAUSE_BONUS_MS);
          }
        }}
        disabled={pauseAfterThis}
        style={{
          marginTop: 6,
          alignSelf: "center",
          backgroundColor: pauseAfterThis ? "#475569" : "#334155",
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "white", fontWeight: "800" }}>
          {pauseAfterThis ? "Pause etter dette (aktivert)" : "Pause etter dette spørsmålet"}
        </Text>
      </Pressable>

      <View style={styles.options}>
        {q.options.map((opt) => {
          const isChosen = chosen === opt.id;
          const isCorrect = q?.correctId === opt.id;
          let btnStyle = styles.btn;
          if (locked) {
            if (isCorrect) btnStyle = styles.btnCorrect;
            else if (isChosen && !isCorrect) btnStyle = styles.btnWrong;
          } else if (isChosen) {
            btnStyle = styles.btnChosen;
          }
          return (
            <TouchableOpacity
              key={opt.id}
              style={btnStyle}
              activeOpacity={0.85}
              onPress={() => onChoose(opt)}
            >
              <Text style={styles.btnText}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {showPause && (
        <View
          pointerEvents="auto"
          style={{
            position: "absolute",
            left: 0, right: 0, top: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.9)",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <Text style={{ color: "white", fontSize: 20, fontWeight: "800", marginBottom: 12 }}>
            Pause
          </Text>
          <Text style={{ color: "#cbd5e1", textAlign: "center", marginBottom: 16 }}>
            Vil du gjenoppta spillet eller avslutte?
          </Text>

          <Pressable
            onPress={() => { setShowPause(false); onNext(); }}
            style={{ backgroundColor: "#22c55e", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, marginBottom: 10 }}
          >
            <Text style={{ color: "white", fontWeight: "800" }}>Gjenoppta spillet</Text>
          </Pressable>

          <Pressable
            onPress={() => { setShowPause(false); router.replace("/start"); }}
            style={{ backgroundColor: "#ef4444", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10 }}
          >
            <Text style={{ color: "white", fontWeight: "800" }}>Avslutt spill</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  empty: { fontSize: 16, fontWeight: "600", marginBottom: 6, textAlign: "center", color: "#FFF" },
  hint: { fontSize: 13, color: "#BBB", textAlign: "center" },
  imageWrap: { alignSelf: "center", width: 260, height: 140, marginBottom: 10 },
  question: { color: "#FFFFFF", fontSize: 19, fontWeight: "800", marginBottom: 12, textAlign: "center" },
  flag: { width: "100%", height: "100%" },
  flagOverlay: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 },
  options: { gap: 10, marginTop: 8 },
  btn: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, backgroundColor: "#f1f1f1" },
  btnChosen: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, backgroundColor: "#e5e5e5" },
  btnCorrect: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, backgroundColor: "#2e7d32" },
  btnWrong: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, backgroundColor: "#c62828" },
  btnText: { color: "#111", fontSize: 16, fontWeight: "600" },
  title: { fontSize: 20, fontWeight: "800", marginBottom: 8, color: "#FFF" },
  sub: { color: "#BBB", marginBottom: 16 },
  meters: { color: "#BBB", fontSize: 14, textAlign: "center", marginBottom: 6 },
});
