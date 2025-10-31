// components/posters/HelperPickupPoster.tsx
import React from "react";
import { View, Text, Pressable, StyleSheet, Modal, Image } from "react-native";
import type { HelperKey } from "../../src/types/helpers";
import { getHelperImage } from "../../src/data/helper_images";


type Props = {
  visible: boolean;
  helper: HelperKey;
  onAccept: (helper: HelperKey) => void; // kalles når spiller tar med i sekken
  onClose: () => void;                   // lukk uten å gjøre noe
};

export default function HelperPickupPoster({ visible, helper, onAccept, onClose }: Props) {
  const src = getHelperImage(helper);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.h1}>Nytt hjelpemiddel!</Text>
          <View style={styles.iconBox}>
            <Image source={src} style={{ width: 96, height: 96, resizeMode: "contain" }} />
          </View>
          <Text style={styles.helperName}>{helper}</Text>
          <Text style={styles.body}>
            Dette hjelpemidlet legges i sekken din. Du kan bruke det på riktig stopp.
          </Text>

          <View style={styles.row}>
            <Pressable style={[styles.btn, styles.btnGhost]} onPress={onClose} accessibilityRole="button">
              <Text style={styles.btnGhostTxt}>Senere</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, styles.btnPrimary]}
              onPress={() => onAccept(helper)}
              accessibilityRole="button"
            >
              <Text style={styles.btnPrimaryTxt}>Legg i sekken</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#0B0B0E",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#374151",
    padding: 16,
  },
  h1: { color: "#fff", fontWeight: "900", fontSize: 18, marginBottom: 8 },
  iconBox: {
    alignSelf: "center",
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  helperName: { color: "#bbf7d0", fontWeight: "800", textAlign: "center", marginBottom: 4 },
  body: { color: "#94a3b8", textAlign: "center", marginBottom: 12 },
  row: { flexDirection: "row", gap: 8, marginTop: 8 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  btnGhost: { backgroundColor: "#111827", borderWidth: 1, borderColor: "#374151" },
  btnGhostTxt: { color: "#e5e7eb", fontWeight: "700" },
  btnPrimary: { backgroundColor: "#2563eb" },
  btnPrimaryTxt: { color: "#fff", fontWeight: "800" },
});
