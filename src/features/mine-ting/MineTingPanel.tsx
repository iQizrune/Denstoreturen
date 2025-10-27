import React, { useEffect, useState } from "react";
import { Modal, View, Text, Pressable, ScrollView, Image, StyleSheet } from "react-native";
import { mineTingStore } from "./mineTingStore";
import { itemIconMap } from "./itemIcons";

type HelpItemStatus = "uncollected" | "collected" | "used-correct" | "used-wrong";
type HelpItem = { id: string; name: string; key: string; status: HelpItemStatus };
type Coat = { id: string; name: string }; // byvåpen (placeholder)

// TODO: Koble til ekte state senere. Nå: enkel placeholder som ikke endrer spillflyt.
const demoItems: HelpItem[] = [
  { id: "i1", name: "Harpun", key: "harpun", status: "collected" },
  // { id: "i2", name: "Kompass", key: "kompass", status: "used-correct" },
  // { id: "i3", name: "Tau", key: "tau", status: "used-wrong" },
];
const demoCoats: Coat[] = [
  // { id: "c1", name: "Mandal" },
];

export default function MineTingPanel() {
  const [open, setOpen] = useState(mineTingStore.open);

  useEffect(() => {
    return mineTingStore.subscribe(() => setOpen(mineTingStore.open));
  }, []);

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => mineTingStore.closePanel()}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Mine ting</Text>
            <Pressable onPress={() => mineTingStore.closePanel()} accessibilityRole="button" accessibilityLabel="Lukk Mine ting">
              <Text style={styles.close}>Lukk</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {/* Byvåpen */}
            <Text style={styles.sectionTitle}>Byvåpen</Text>
            {demoCoats.length === 0 ? (
              <Text style={styles.empty}>Ingen byvåpen ennå.</Text>
            ) : (
              <View style={styles.grid}>
                {demoCoats.map((c) => (
                  <View key={c.id} style={styles.coat}>
                    <Text style={styles.coatLabel}>{c.name}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Hjelpemidler */}
            <Text style={styles.sectionTitle}>Hjelpemidler</Text>
            <View style={styles.grid}>
              {demoItems.map((it) => {
                const icon = itemIconMap[it.key];
                const stateStyle =
                  it.status === "used-correct"
                    ? styles.usedCorrect
                    : it.status === "used-wrong"
                    ? styles.usedWrong
                    : styles.collected;
                return (
                  <View key={it.id} style={[styles.itemCard, stateStyle]}>
                    {icon ? (
                      <Image source={icon} style={styles.icon} resizeMode="contain" />
                    ) : (
                      <View style={[styles.icon, styles.placeholderIcon]}>
                        <Text>🧰</Text>
                      </View>
                    )}
                    <Text style={styles.itemLabel}>{it.name}</Text>
                  </View>
                );
              })}
            </View>

            {/* Statistikk (kan være tom i første runde) */}
            <Text style={styles.sectionTitle}>Statistikk</Text>
            <Text style={styles.empty}>Kommer snart: total effektiv tid, per-kategori m.m.</Text>
          </ScrollView>
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
  usedCorrect: { backgroundColor: "#FFEBA2" }, // "gull" lys
  usedWrong: { backgroundColor: "#E9E9E9" },   // grå
  icon: { width: 40, height: 40, marginBottom: 4 },
  placeholderIcon: {
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  itemLabel: { fontSize: 12, textAlign: "center" },
  coat: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#F8F8F8",
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
    marginBottom: 8,
  },
  coatLabel: { fontSize: 12 },
});
