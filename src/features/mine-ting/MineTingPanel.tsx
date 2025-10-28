// src/features/mine-ting/MineTingPanel.tsx
// Auto-generated update (2025-10-27): Byvåpen koblet til bagStore, select-modus, flere footer-knapper, lockClose.

import React, { useEffect, useMemo, useState } from "react";
import { Modal, View, Text, Pressable, ScrollView, Image, StyleSheet } from "react-native";
import { mineTingStore, HelpItem } from "./mineTingStore";
import { itemIconMap } from "./itemIcons";

// Les samme kilde som 5/6-flyten bruker
import { getItems as getBagItems, subscribe as subscribeBag } from "@/components/bag/bagStore";
import { COAT_IMAGES as coatImages } from "@/src/data/coat_images";

type Coat = { city: string };

export default function MineTingPanel() {
  const [open, setOpen] = useState(mineTingStore.open);
  const [mode, setMode] = useState(mineTingStore.mode);
  const [items, setItems] = useState<HelpItem[]>(mineTingStore.items);
  const [footerButtons, setFooterButtons] = useState(mineTingStore.footerButtons);
  const [lockClose, setLockClose] = useState(mineTingStore.lockClose);

  // Byvåpen fra samme state som 5/6-rutinen
  const [coats, setCoats] = useState<Coat[]>(() =>
    getBagItems().filter((it: any) => it.kind === "coat").map((it: any) => ({ city: it.city }))
  );

  useEffect(() => {
    // Sync mot bagStore (coats)
    const offBag = subscribeBag(() => {
      const all = getBagItems();
      setCoats(all.filter((it: any) => it.kind === "coat").map((it: any) => ({ city: it.city })));
    });

    // Sync mot vår lokale store (åpen/modus/items/footer/lockClose)
    const offLocal = mineTingStore.subscribe(() => {
      setOpen(mineTingStore.open);
      setMode(mineTingStore.mode);
      setItems(mineTingStore.items);
      setFooterButtons(mineTingStore.footerButtons);
      setLockClose(mineTingStore.lockClose);
    });

    return () => {
      offBag?.();
      offLocal?.();
    };
  }, []);

  useEffect(() => {
    if (open) {
      const all = getBagItems();
      setCoats(all.filter((it: any) => it.kind === "coat").map((it: any) => ({ city: it.city })));
    }
  }, [open]);

  const selectCtx = mineTingStore.selectCtx;

  // Hvilke hjelpemidler kan velges i select-modus?
  const selectableIds = useMemo(() => {
    if (mode !== "select") return new Set<string>();
    const allowed = selectCtx?.allowKeys ? new Set(selectCtx.allowKeys) : null;
    const ids = new Set<string>();
    items.forEach((it) => {
      if (it.status !== "collected") return; // kun ubrukte
      if (allowed && !allowed.has(it.key)) return;
      ids.add(it.id);
    });
    return ids;
  }, [mode, selectCtx, items]);

  const onPressItem = (id: string) => {
    if (mode === "select" && selectableIds.has(id)) {
      mineTingStore.pickItem(id);
    }
  };

  // Normaliser “Mandal” -> “mandal”, “Lindesnes fyr” -> “lindesnes-fyr” osv.
  const toSlug = (city: string) => city.toLowerCase().replace(/\s+/g, "-");

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (mode === "select") {
          mineTingStore.cancelSelect();
        } else {
          if (!lockClose) mineTingStore.closePanel();
        }
      }}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {mode === "select" ? selectCtx?.title || "Velg hjelpemiddel" : "Mine ting"}
            </Text>
            <Pressable
              onPress={() => {
                if (mode === "select") return mineTingStore.cancelSelect();
                if (lockClose) return;
                mineTingStore.closePanel();
              }}
              accessibilityRole="button"
              accessibilityLabel={
                mode === "select" ? "Avbryt valg" : (lockClose ? "Lukking er deaktivert" : "Lukk Mine ting")
              }
            >
              <Text style={[styles.close, lockClose && { opacity: 0.4 }]}>
                {mode === "select" ? "Avbryt" : (lockClose ? "Låst" : "Lukk")}
              </Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {/* Byvåpen (samme kilde som 5/6-flyt) */}
            {mode === "view" && (
              <>
                <Text style={styles.sectionTitle}>Byvåpen</Text>
                {coats.length === 0 ? (
                  <Text style={styles.empty}>Ingen byvåpen ennå.</Text>
                ) : (
                  <View style={styles.grid}>
                    {coats.map((c, idx) => {
                      const raw = String(c.city || "");
                      const slug = raw
                        .normalize("NFKD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-+|-+$/g, "");

                      const images = coatImages as Record<string, any>;
                      const img =
                        images[slug] ??
                        images[raw] ??
                        images[raw.toLowerCase()] ??
                        images[raw.replace(/\s+/g, "-").toLowerCase()];

                      return (
                        <View
                          key={slug + ":" + idx}
                          style={{ alignItems: "center", marginRight: 8, marginBottom: 8 }}
                        >
                          {img ? (
                            <Image source={img} style={{ width: 48, height: 48 }} resizeMode="contain" />
                          ) : (
                            <View style={[styles.icon, styles.placeholderIcon]}><Text>🛡️</Text></View>
                          )}
                          <Text style={{ fontSize: 11, marginTop: 4 }}>{c.city}</Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </>
            )}

            {/* Hjelpemidler */}
            <Text style={styles.sectionTitle}>
              {mode === "select" ? "Velg et hjelpemiddel" : "Hjelpemidler"}
            </Text>
            <View style={styles.grid}>
              {items.map((it) => {
                const icon = itemIconMap[it.key];
                const isSelectable = selectableIds.has(it.id);
                const stateStyle =
                  it.status === "used-correct"
                    ? styles.usedCorrect
                    : it.status === "used-wrong"
                    ? styles.usedWrong
                    : styles.collected;
                const pressableStyle = isSelectable ? styles.selectable : styles.notSelectable;
                return (
                  <Pressable
                    key={it.id}
                    onPress={() => onPressItem(it.id)}
                    disabled={!isSelectable}
                    style={[styles.itemCard, stateStyle, pressableStyle]}
                  >
                    {icon ? (
                      <Image source={icon} style={styles.icon} resizeMode="contain" />
                    ) : (
                      <View style={[styles.icon, styles.placeholderIcon]}><Text>🧰</Text></View>
                    )}
                    <Text style={styles.itemLabel}>{it.name}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* "Vet ikke" i select-modus */}
            {mode === "select" && (
              <View style={{ marginTop: 12 }}>
                <Pressable
                  onPress={() => mineTingStore.cancelSelect()}
                  style={{
                    paddingVertical: 10,
                    alignSelf: "flex-start",
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: "#ddd",
                  }}
                >
                  <Text>Vet ikke</Text>
                </Pressable>
              </View>
            )}

            {/* Statistikk (kun i view-modus) */}
            {mode === "view" && (
              <>
                <Text style={styles.sectionTitle}>Statistikk</Text>
                <Text style={styles.empty}>Kommer snart: total effektiv tid, per-kategori m.m.</Text>
              </>
            )}
          </ScrollView>

          {/* Footer-knapper */}
          {mode === "view" && footerButtons.length > 0 && (
            <View style={{ marginTop: 8, flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
              {footerButtons.map((btn, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => mineTingStore.triggerFooterByIndex(idx)}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 10,
                    ...(btn.variant === "primary"
                      ? { backgroundColor: "#2563eb" }
                      : { borderWidth: 1, borderColor: "#ddd", backgroundColor: "white" }),
                  }}
                >
                  <Text style={{ color: btn.variant === "primary" ? "white" : "#111827", fontWeight: "700" }}>
                    {btn.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "92%",
    maxWidth: 560,
    borderRadius: 16,
    backgroundColor: "white",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: { fontSize: 20, fontWeight: "700" },
  close: { fontSize: 16 },
  content: { paddingBottom: 8 },
  sectionTitle: { marginTop: 12, marginBottom: 6, fontWeight: "700" },
  empty: { opacity: 0.7 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  } as any,
  itemCard: {
    width: 96,
    height: 96,
    borderRadius: 12,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  collected: { backgroundColor: "#F8F8F8" },
  // Forsterket gull (minimalt inngrep – kun stilverdier)
  usedCorrect: {
    backgroundColor: "#facc15",          // kraftigere gull (amber-400)
    borderColor:   "#a16207",            // dypere gullkant (amber-700)
    shadowColor:   "rgba(161,98,7,0.45)",
    shadowOpacity: 0.5,
    shadowRadius:  10,
    elevation:     8,
  },
  usedWrong: { backgroundColor: "#E9E9E9" },
  selectable: { opacity: 1 },
  notSelectable: { opacity: 0.4 },
  icon: { width: 40, height: 40, marginBottom: 4 },
  placeholderIcon: {
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  itemLabel: { fontSize: 12, textAlign: "center" },
});
