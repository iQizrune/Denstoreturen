// app/profile.tsx
import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, Image, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { getProfile, setProfile, updateProfile, type Profile } from "@/src/state/profile";

// Aldersband (som før)
type AgeBand = "barn" | "ungdom" | "voksen" | "senior";
const AGE_LABELS: Record<AgeBand, string> = {
  barn: "Barn", ungdom: "Ungdom", voksen: "Voksen", senior: "Senior",
};

// Avatar-liste (id → require()). ID-en lagres i profile.avatar
const AVATARS = [
  { id: "valp",  src: require("@/assets/avatars/valp.png") },
  { id: "fotball", src: require("@/assets/avatars/fotball.png") },
  { id: "ugle",  src: require("@/assets/avatars/ugle.png") },
  { id: "ulv", src: require("@/assets/avatars/ulv.png") },
  { id: "apekatt", src: require("@/assets/avatars/apekatt.png") },
  { id: "ørn",src: require("@/assets/avatars/ørn.png") },
  { id: "tursko",src: require("@/assets/avatars/tursko.png") },
  { id: "pusekatt",src: require("@/assets/avatars/pusekatt.png") },
];

export default function ProfileScreen() {
  const router = useRouter();
  const initial = getProfile?.() as Profile | undefined;

  const [name, setName] = useState(() => (initial?.name ?? "").trim());
  const [ageGroup, setAgeGroup] = useState<AgeBand>(() => {
    const g = (initial?.ageGroup as AgeBand) ?? "voksen";
    return (["barn","ungdom","voksen","senior"] as AgeBand[]).includes(g) ? g : "voksen";
  });
  const [avatar, setAvatar] = useState<string>(() => initial?.avatar || "valp");

  function toAgeGroupForProfile(band: AgeBand): Profile["ageGroup"] {

  // "ungdom" finnes ikke i Profile.AgeGroup-typen, map til "voksen"

  if (band === "ungdom") return "voksen" as Profile["ageGroup"];
  return band as unknown as Profile["ageGroup"];
}


  const canSave = useMemo(() => name.trim().length >= 2, [name]);

  const onSave = () => {
  if (!canSave) return;
  const next: Profile = {
    name: name.trim(),
    ageGroup: toAgeGroupForProfile(ageGroup),
    avatar,
  };
  try {
    setProfile(next);
  } catch {
    updateProfile(next);
  }
  router.replace("/info/2");
};


  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: "#0b132b",
        padding: 20,
        paddingTop: 60,
      }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <Text style={{ color: "white", fontSize: 24, fontWeight: "800", textAlign: "center", marginBottom: 8 }}>
        Lag profil
      </Text>
      <Text style={{ color: "#cbd5e1", textAlign: "center", marginBottom: 16 }}>
        Navn, aldersgruppe og avatar kan endres senere.
      </Text>

      {/* Navn */}
      <View style={{ gap: 6, marginBottom: 16 }}>
        <Text style={{ color: "#9ca3af", fontWeight: "700" }}>Navn</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ditt navn"
          placeholderTextColor="#64748b"
          style={{
            backgroundColor: "#111827",
            borderColor: "#374151",
            borderWidth: 1,
            color: "white",
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        />
      </View>

      {/* Aldersband */}
      <View style={{ gap: 8, marginBottom: 18 }}>
        <Text style={{ color: "#9ca3af", fontWeight: "700", marginBottom: 2 }}>Aldersgruppe</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {(Object.keys(AGE_LABELS) as AgeBand[]).map((k) => {
            const active = ageGroup === k;
            return (
              <Pressable
                key={k}
                onPress={() => setAgeGroup(k)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: active ? "#3b82f6" : "#374151",
                  backgroundColor: active ? "#1d4ed8" : "#111827",
                }}
              >
                <Text style={{ color: active ? "white" : "#cbd5e1", fontWeight: "700" }}>
                  {AGE_LABELS[k]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Avatar-velger */}
      <View style={{ gap: 8, marginBottom: 10 }}>
        <Text style={{ color: "#9ca3af", fontWeight: "700", marginBottom: 6 }}>Velg avatar</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 }}>
          {AVATARS.map((a) => {
            const active = avatar === a.id;
            return (
              <Pressable
                key={a.id}
                onPress={() => setAvatar(a.id)}
                style={{
                  width: "30%",
                  aspectRatio: 1,
                  borderRadius: 14,
                  borderWidth: 2,
                  borderColor: active ? "#22c55e" : "#334155",
                  backgroundColor: "#0f172a",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <Image source={a.src} style={{ width: "90%", height: "90%", resizeMode: "contain" }} />
                <View style={{
                  position: "absolute",
                  bottom: 6,
                  left: 6,
                  right: 6,
                  backgroundColor: active ? "rgba(34,197,94,0.15)" : "rgba(2,6,23,0.35)",
                  borderRadius: 8,
                  paddingVertical: 2,
                }}>
                  <Text style={{
                    color: active ? "#bbf7d0" : "#94a3b8",
                    fontSize: 12,
                    fontWeight: "700",
                    textAlign: "center",
                    textTransform: "capitalize",
                  }}>
                    {a.id}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Lagre / Hopp over */}
      <View style={{ marginTop: 18, gap: 10 }}>
        <Pressable
          onPress={onSave}
          disabled={!canSave}
          style={{
            paddingVertical: 14,
            borderRadius: 12,
            backgroundColor: canSave ? "#22c55e" : "#374151",
          }}
        >
          <Text style={{ color: canSave ? "#052e16" : "#9ca3af", fontWeight: "900", textAlign: "center" }}>
            Lagre og fortsett
          </Text>
        </Pressable>

        <Pressable onPress={() => { router.replace("/info/2"); }} style={{ padding: 10 }}>
          <Text style={{ color: "#9ca3af", textAlign: "center" }}>Hopp over</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
