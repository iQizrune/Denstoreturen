// src/partials/PlayingPanels.tsx
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { categoryFor } from "@/src/lib/sequencePlan";
import { buildQuizPool } from "@/src/banks/buildQuizPool";
import { FLAGS_ASSETS } from "@/src/banks/flagsAssets";
import { REVEAL_ASSETS } from "@/src/banks/revealAssets";
import { addMeters, getTotalMeters } from "@/src/state/run";
import TimeBar from "@/src/partials/TimeBar";
import { publishMeters, subscribeMeters } from "@/src/lib/progressBus";

/** ========= Konfig ========= */
const DEBUG = false;
const HEADER_ESTIMATE = 96;
const BOTTOM_ESTIMATE = 40;
const SEED = "runde-1";
const AUTONEXT_MS = 650;
const REVEAL_MS = 10000;
const LIGHTNING_MS = 15000;
const CORE_MS = 6000;
const EXTRALIFE_MS = 3000;

/** ========= Lokale typer ========= */
type QAOption = { id: string; label: string; isCorrect?: boolean };
type QA = {
  id: string;
  text: string;
  options: QAOption[];
  correctId?: string;
  image?: any;
  meta?: any;
};

export default function PlayingPanels({ roundSeed = 0 }: { roundSeed?: number }) {
  const insets = useSafeAreaInsets();
  const { height: winH } = useWindowDimensions();

  const padTop = Math.round(insets.top + HEADER_ESTIMATE);
  const padBottom = Math.round(insets.bottom + BOTTOM_ESTIMATE);

  // Bygg hele spørsmåls-køen i riktig kategori-rekkefølge for denne runden/etappen
  const queue = useMemo<QA[]>(() => {
    const managed = buildQuizPool({
      enabled: {
        core: true,
        flags: true,
        trick: true,
        bonus: true,
        reveal: true,
        lightning: true,
        extralife: true,
      },
      // weights beholdes for bakoverkompabilitet – rekkefølgen styres av categoryFor
      weights: { core: 3, flags: 2, trick: 1, bonus: 1, reveal: 1, lightning: 1, extralife: 1 },
      maxTotal: 300,
      seed: SEED,
      shuffleOptions: true,
    });

    const base: QA[] = managed.map((q: any) => ({
      id: q.id,
      text: q.text,
      options: q.options.map((o: any) => ({
        id: o.id,
        label: o.label,
        isCorrect: q?.correctId === o?.id,
      })),
      correctId: q.correctId,
      meta: q.meta || {},
      image: q.image,
    }));

    if (!base.length) {
      if (DEBUG) console.log("[PlayingPanels] ingen spørsmål tilgjengelig");
      return [];
    }

    // Pool pr. kategori
    const pools: Record<string, QA[]> = {
      core: [],
      flags: [],
      bonus: [],
      reveal: [],
      trick: [],
      lightning: [],
      extralife: [],
    };
    for (const q of base) {
      const kind = (q?.meta?.kind as string) || "core";
      (pools[kind] ?? pools.core).push(q);
    }

    // Pekere i hver kategori
    const idx: Record<string, number> = {
      core: 0,
      flags: 0,
      bonus: 0,
      reveal: 0,
      trick: 0,
      lightning: 0,
      extralife: 0,
    };

    const take = (kind: string): QA | null => {
      const p = pools[kind];
      if (!p || idx[kind] >= p.length) return null;
      const item = p[idx[kind]];
      idx[kind] += 1;
      return item;
    };

    const takeFallback = (): QA | null => {
      // fallbackrekkefølge hvis ønsket kategori er tom
      const order = ["core", "flags", "bonus", "reveal", "trick", "lightning", "extralife"];
      for (const k of order) {
        const got = take(k);
        if (got) return got;
      }
      return null;
    };

    // Bygg deterministisk sekvens etter plan (1-basert indeks)
    const planLen = base.length; // bruk alle tilgjengelige spørsmål
    const out: QA[] = [];
    for (let i = 1; i <= planLen; i++) {
      const target = categoryFor(i);
      const picked = take(target) || takeFallback();
      if (picked) out.push(picked);
      else break;
    }

    return out;
  }, [roundSeed]);

  const [i, setI] = useState(0);
  const [locked, setLocked] = useState(false);
  const [chosen, setChosen] = useState<string | null>(null);
  const [meters, setMeters] = useState(getTotalMeters());

  const nextTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealFade = useRef(new Animated.Value(0)).current; // 1 = blur overlay synlig, 0 = klart
  const revealStartAt = useRef<number>(0);
  const lightningEndAt = useRef<number | null>(null); // slutt-tid for lightning-vindu

  const q = queue[i];

  // Reset per spørsmål + reveal + lightning-session håndtering
  useEffect(() => {
    setChosen(null);
    setLocked(false);
    if (nextTimer.current) {
      clearTimeout(nextTimer.current);
      nextTimer.current = null;
    }

    const avdekkingPath = (q as any)?.avdekking ?? (q as any)?.meta?.avdekking ?? "";
    const isReveal = typeof avdekkingPath === "string" && avdekkingPath.length > 0;
    const isLightning = (q?.meta?.kind as string) === "lightning";

    if (isReveal) {
      revealStartAt.current = Date.now();
      revealFade.setValue(1);
      Animated.timing(revealFade, {
        toValue: 0,
        duration: REVEAL_MS,
        useNativeDriver: true,
      }).start();
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

  // Rydd ved unmount
  useEffect(() => {
    return () => {
      if (nextTimer.current) {
        clearTimeout(nextTimer.current);
        nextTimer.current = null;
      }
    };
  }, []);

  // Sync lokal visning med bus (HUD) ved eksterne endringer (dev-knapp)
  useEffect(() => {
    const unsub = subscribeMeters(({ meters }) => {
      setMeters(meters);
    });
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

  // ← VIKTIG: ferdig-guard før vi bruker `q`
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
    let delta = 0;

    if (kind === "core" || kind === "flags") {
      delta = isCorrect ? 10 : 0;
    } else if (kind === "bonus") {
      const d = (q?.meta?.difficulty || (q?.meta?.level ?? "easy")).toString().toLowerCase();
      const bonusMap: Record<string, number> = { easy: 10, medium: 50, hard: 100 };
      delta = isCorrect ? (bonusMap[d] ?? 10) : 0;
    } else if (kind === "lightning") {
      delta = isCorrect ? 20 : 0;
      // i lightning hopper vi IKKE ut av kategorien før 15s er brukt opp
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
      setTimeout(() => publishMeters(total), 0); // ikke publiser under render
      setMeters(total);
    }

    setLocked(true);

    // Auto-neste: alltid ved svar, men lightning skal fortsette innen 15s-vinduet
    if (nextTimer.current) clearTimeout(nextTimer.current);
    nextTimer.current = setTimeout(() => {
      onNext();
    }, AUTONEXT_MS);
  }

  // ---- Bildeoppslag ----
  const code =
    (q as any)?.meta?.code ?? (q as any)?.meta?.key ?? (q as any)?.code ?? "";
  const assetFromCode =
    typeof code === "string" ? FLAGS_ASSETS[(code as string).toLowerCase()] : undefined;

  const avdekkingPath = (q as any)?.avdekking ?? (q as any)?.meta?.avdekking ?? "";
  const avKey =
    typeof avdekkingPath === "string"
      ? avdekkingPath.split("/").pop()?.replace(/\.(png|jpg|jpeg)$/i, "")?.toLowerCase()
      : "";
  const revealAsset = avKey ? REVEAL_ASSETS[avKey] : undefined;

  const displayImage = revealAsset || q?.image || assetFromCode || null;

  if (DEBUG) {
    console.log("[PlayingPanels] q", {
      id: q?.id,
      kind: q?.meta?.kind,
      textLen: q?.text?.length ?? 0,
      code,
      correctId: q?.correctId ?? "(mangler)",
    });
  }

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
      {/* Toppstatus + timer */}
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
        }
        return (
          <TimeBar
            key={kind === "lightning" ? "lightning-session" : q.id} // lightning: én 15s-sesjon
            durationMs={durationMs}
            paused={kind === "lightning" ? false : locked} // lightning fortsetter selv etter svar
            height={6}
            trackColor="#222"
            barColor={kind === "reveal" ? "#F39C12" : kind === "lightning" ? "#E74C3C" : "#27AE60"}
            onElapsed={() => {
              if ((q?.meta?.kind as string) === "lightning") {
                // Hele 15s er brukt opp → videre
                lightningEndAt.current = null;
                onNext();
              } else {
                // Andre kategorier: time-out = auto neste
                onNext();
              }
            }}
          />
        );
      })()}

      {/* Spørsmålstekst */}
      <Text style={styles.question}>{q.text}</Text>

      {/* Bilde (flag/reveal) */}
      {displayImage ? (
        <View style={styles.imageWrap}>
          {/* Klar versjon i bunn */}
          <Image source={displayImage} style={styles.flag} resizeMode="contain" accessible />
          {/* Blur-overlay som fader bort ved reveal */}
          <Animated.View pointerEvents="none" style={[styles.flagOverlay, { opacity: revealFade }]}>
            <Image source={displayImage} style={styles.flag} resizeMode="contain" blurRadius={30} />
          </Animated.View>
        </View>
      ) : null}

      {/* Svaralternativer */}
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
    </ScrollView>
  );
}

/** ========= Styles ========= */
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  empty: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    textAlign: "center",
    color: "#FFF",
  },
  hint: {
    fontSize: 13,
    color: "#BBB",
    textAlign: "center",
  },
  imageWrap: {
    alignSelf: "center",
    width: 260,
    height: 140,
    marginBottom: 10,
  },
  question: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 12,
    textAlign: "center",
  },
  flag: {
    width: "100%",
    height: "100%",
  },
  flagOverlay: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  options: {
    gap: 10,
    marginTop: 8,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#f1f1f1",
  },
  btnChosen: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#e5e5e5",
  },
  btnCorrect: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#2e7d32",
  },
  btnWrong: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#c62828",
  },
  btnText: {
    color: "#111",
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
    color: "#FFF",
  },
  sub: {
    color: "#BBB",
    marginBottom: 16,
  },
  meters: {
    color: "#BBB",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 6,
  },
});
