// app/profile.tsx
import React, { useMemo, useState } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { getProfile, setProfile } from "@/src/state/profile";

// Tilpass gjerne hvis du har en streng-union type i prosjektet
type AgeGroup = "barn" | "ungdom" | "voksen";

const AGE_GROUPS: { key: AgeGroup; label: string; hint: string }[] = [
  { key: "barn", label: "Barn", hint: "ca. 6–12" },
  { key: "ungdom", label: "Ungdom", hint: "ca. 13–17" },
  { key: "voksen", label: "Voksen", hint: "18+" },
];

export default function ProfileScreen() {
  const initial = useMemo(() => {
    try {
      return getProfile?.();
    } catch {
      return { name: "", ageGroup: "voksen", avatar: "🚶" } as any;
    }
  }, []);

  const [name, setName] = useState<string>(initial?.name ?? "");
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(
    (initial?.ageGroup as AgeGroup) ?? "voksen"
  );

  const canSave = name.trim().length >= 2;

  const onSave = () => {
    if (!canSave) return;
    setProfile({
      name: name.trim(),
      ageGroup,
      avatar: initial?.avatar ?? "🚶",
    } as any);
    router.replace("/pre-etappe");
  };

  const onSkip = () => {
    // Bevar eksisterende avatar/ageGroup om de fantes
    setProfile({
      name: name.trim() || (initial?.name ?? ""),
      ageGroup: ageGroup ?? (initial?.ageGroup ?? "voksen"),
      avatar: initial?.avatar ?? "🚶",
    } as any);
    router.replace("/pre-etappe");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Lag profil</Text>
        <Text style={styles.subtitle}>
          Fortell oss hvem som skal ut på tur. Vi bruker aldersbånd, ikke nøyaktig alder.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>Navn</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Skriv inn navn"
            placeholderTextColor="#8B8B8F"
            style={styles.input}
            returnKeyType="done"
            onSubmitEditing={onSave}
            autoCapitalize="words"
          />
          <Text style={styles.help}>Minst 2 tegn. Fornavn eller kallenavn er fint.</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Aldersbånd</Text>
          <View style={styles.segmentRow}>
            {AGE_GROUPS.map((g) => {
              const active = ageGroup === g.key;
              return (
                <TouchableOpacity
                  key={g.key}
                  accessibilityRole="button"
                  onPress={() => setAgeGroup(g.key)}
                  style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                >
                  <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                    {g.label}
                  </Text>
                  <Text style={[styles.segmentHint, active && styles.segmentTextActive]}>
                    {g.hint}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.help}>
            Dette styrer vanskelighet/innhold uten å lagre nøyaktig alder.
          </Text>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={onSave}
            disabled={!canSave}
            style={[styles.primaryBtn, !canSave && styles.btnDisabled]}
          >
            <Text style={styles.primaryText}>Lagre og fortsett</Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            onPress={onSkip}
            style={styles.secondaryBtn}
          >
            <Text style={styles.secondaryText}>Hopp over</Text>
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
    paddingTop: 24, // ~1 cm offset ned
  },
  title: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#CCCCCC",
    textAlign: "center",
    marginBottom: 24,
  },
  field: {
    marginBottom: 18,
  },
  label: {
    color: "#E5E7EB",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#1F2430",
    color: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  help: {
    color: "#8B8B8F",
    fontSize: 12,
    marginTop: 6,
  },
  segmentRow: {
    flexDirection: "row",
    gap: 8,
  } as any,
  segmentBtn: {
    flex: 1,
    backgroundColor: "#1F2430",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
  },
  segmentBtnActive: {
    backgroundColor: "#0B66D4",
    borderColor: "#0B66D4",
  },
  segmentText: {
    color: "#E5E7EB",
    fontSize: 14,
    fontWeight: "700",
  },
  segmentTextActive: {
    color: "#FFFFFF",
  },
  segmentHint: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 2,
  },
  buttons: {
    marginTop: 16,
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: "#0B66D4",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  btnDisabled: {
    opacity: 0.5,
  },
  secondaryBtn: {
    backgroundColor: "#1F2937",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
