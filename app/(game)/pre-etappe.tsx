// app/(game)/pre-etappe.tsx
import React from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";

const ETAPPE1_PATH = "/play"; // Endre hvis etappe 1-plakaten din har en annen path

export default function PreEtappeScreen() {
  const goToMap = () => {
    router.push({ pathname: "/kart", params: { returnTo: "/pre-etappe" } });
  };

  const goToEtappe1 = () => {
    router.replace(ETAPPE1_PATH);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Mellom-plakat</Text>
        <Text style={styles.subtitle}>
          Her kommer mer innhold etter hvert (introduksjon, tips, regler, m.m.).
        </Text>

        <View style={styles.buttons}>
          <TouchableOpacity accessibilityRole="button" style={styles.primaryBtn} onPress={goToMap}>
            <Text style={styles.primaryText}>Åpne kart</Text>
          </TouchableOpacity>

          <TouchableOpacity accessibilityRole="button" style={styles.secondaryBtn} onPress={goToEtappe1}>
            <Text style={styles.secondaryText}>Gå til 1. etappe-plakaten</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B0B0E" },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24, // liten “offset” ned
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#CCCCCC",
    textAlign: "center",
    marginBottom: 24,
  },
  buttons: {
    width: "100%",
    gap: 12,
    marginTop: 8,
  },
  primaryBtn: {
    backgroundColor: "#0B66D4",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  secondaryBtn: {
    backgroundColor: "#1F2937",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});
