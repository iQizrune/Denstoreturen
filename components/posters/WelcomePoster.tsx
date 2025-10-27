import React from "react";
import { View, Text, Pressable, StyleSheet, Image } from "react-native";

type Props = {
  visible: boolean;
  onContinue: () => void;
};

export default function WelcomePoster({ visible, onContinue }: Props) {
  if (!visible) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <Image
          source={require("@/assets/images/krikerogkrokerlogo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Velkommen til Den store gåturen!</Text>
        <Text style={styles.subtitle}>
          Gå fra Lindesnes til Kirkenes – steg for steg, by for by.
          Underveis svarer du på spørsmål, vinner meter og samler byvåpen.
        </Text>

        <Text style={styles.body}>
          Hvert stopp gir deg nye utfordringer. Velg vanskelighetsgrad,
          test kunnskapen din og oppdag Norge på veien mot nord.
        </Text>

        <Pressable
          onPress={onContinue}
          accessibilityRole="button"
          style={styles.button}
        >
          <Text style={styles.buttonText}>La oss komme i gang!</Text>
        </Pressable>

        <Text style={styles.footer}>
          (Denne plakaten vises bare første gang. Du finner den senere under Hjelp → Om spillet.)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0b132b",
    padding: 24,
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "white",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#cbd5e1",
    textAlign: "center",
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  footer: {
    color: "#64748b",
    fontSize: 12,
    textAlign: "center",
    marginTop: 12,
  },
});
