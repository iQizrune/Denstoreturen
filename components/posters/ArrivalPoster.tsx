import React from "react";
import { View, Text, Pressable, Image, StyleSheet } from "react-native";

type Props = {
  /** Stedsnavn – støtter flere prop-navn for kompatibilitet */
  cityName?: string;
  toName?: string;
  stopName?: string;
  username?: string;


  /** Start-handler – støtter begge navn */
  onStart?: () => void;
  onStartByquiz?: () => void;

  /** Tekst på knappen (default: "Start ByQuiz") */
  buttonText?: string;

  /** Valgfri logo (f.eks. require("../assets/norquiz-logo.png")) */
  logoSource?: any;
};

export default function ArrivalPoster({
  cityName,
  toName,
  stopName,
  username,
  onStart,
  onStartByquiz,
  buttonText = "Start ByQuiz",
  logoSource,
}: Props) {
  // Velg riktig navn og formatter fint
  const raw = (cityName ?? toName ?? stopName ?? "").toString();
  const display = raw.length > 0 ? raw.charAt(0).toUpperCase() + raw.slice(1) : "Stoppested";

  // Velg riktig start-callback
  const handleStart = onStartByquiz ?? onStart ?? (() => {});

  return (
    <View style={styles.wrap} pointerEvents="auto">
      <View style={styles.card}>
        {logoSource ? <Image source={logoSource} style={styles.logo} resizeMode="contain" /> : null}

        <Text style={styles.title}>Velkommen til {display}</Text>
       <Text style={styles.subtitle}>
          Bra jobbet{username ? `, ${username}` : ""}!
        </Text>
        <Text style={styles.caption}>Dette er heretter ditt nye startsted.</Text>
        
        

        <Pressable onPress={handleStart} android_ripple={{ color: "#334155" }} style={styles.cta}>
          <Text style={styles.ctaText}>{buttonText}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    inset: 0 as any,
    backgroundColor: "#0b1220",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    width: "92%",
    maxWidth: 480,
    backgroundColor: "rgba(16,24,39,0.85)",
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.25)",
  },
  logo: {
    width: 120,
    height: 120,
    opacity: 0.95,
    marginBottom: 8,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 6,
  },
  subtitle: {
    color: "#f0fdf4",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 6,
  },
  caption: {
    color: "#cbd5e1",
    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 16,
  },
  cta: {
    marginTop: 8,
    backgroundColor: "#60a5fa",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 200,
    alignItems: "center",
  },
  ctaText: {
    color: "#0b1220",
    fontWeight: "800",
    fontSize: 16,
  },
});
