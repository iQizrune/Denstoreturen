// app/(intro)/info/2.tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function Info2() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: "#0b132b", padding: 24, justifyContent: "center", gap: 12 }}>
      <Text style={{ color: "white", fontSize: 22, fontWeight: "800", textAlign: "center", marginBottom: 8 }}>
        Klar for turen?
      </Text>
      <Text style={{ color: "#cbd5e1", fontSize: 16, textAlign: "center" }}>
        Litt info før du starter etappen. Trykk OK for å gå videre.
      </Text>

      <Pressable
        onPress={() => router.replace("/pre-etappe")}
        style={{ marginTop: 16, backgroundColor: "#22c55e", borderRadius: 12, padding: 14 }}
      >
        <Text style={{ color: "#052e16", fontWeight: "900", textAlign: "center" }}>
          OK
        </Text>
      </Pressable>
    </View>
  );
}
