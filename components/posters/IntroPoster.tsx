import * as React from "react";
import { View, Text, Image, Pressable } from "react-native";

type IntroPosterProps = {
  from: string;
  to: string;
  meters: number;
  onStart: () => void;
  logoSource?: any;
  children?: React.ReactNode;
};

export default function IntroPoster({
  from,
  to,
  meters,
  onStart,
  logoSource,
  children,
}: IntroPosterProps) {
  return (
    <View
      style={{
        width: "92%",
        maxWidth: 520,
        borderRadius: 20,
        backgroundColor: "#0b132b",
        borderWidth: 1,
        borderColor: "#1f2a44",
        padding: 18,
      }}
    >
      {logoSource ? (
        <View style={{ alignItems: "center", marginBottom: 10 }}>
          <Image
            source={logoSource}
            style={{ width: 96, height: 96, borderRadius: 16 }}
            resizeMode="contain"
          />
        </View>
      ) : null}

      <Text
        style={{
          color: "white",
          fontSize: 20,
          fontWeight: "800",
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        Neste etappe
      </Text>

      <View style={{ gap: 6, alignItems: "center", marginBottom: 12 }}>
        <Text style={{ color: "#cbd5e1", fontSize: 14 }}>
          Fra <Text style={{ color: "white", fontWeight: "700" }}>{from}</Text>
        </Text>
        <Text style={{ color: "#cbd5e1", fontSize: 14 }}>
          Til <Text style={{ color: "white", fontWeight: "700" }}>{to}</Text>
        </Text>
        <Text style={{ color: "#93c5fd", fontWeight: "800" }}>{meters} m</Text>
      </View>

      {children ? <View style={{ marginBottom: 12 }}>{children}</View> : null}

      <Pressable
        onPress={onStart}
        android_ripple={{ color: "#1d4ed8" }}
        style={{
          backgroundColor: "#2563eb",
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 12,
        }}
      >
        <Text style={{ color: "white", fontWeight: "800", textAlign: "center" }}>
          Start
        </Text>
      </Pressable>
    </View>
  );
}
