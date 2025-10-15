// components/bag/BagIcon.tsx
import React from "react";
import { Image, View, Text } from "react-native";
import { COAT_IMAGES } from "../../src/coat_images";

function slugify(s?: string) {
  const raw = String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return raw.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function BagIcon({
  slug,
  city,
  size = 56,
}: {
  slug?: string;
  city?: string;
  size?: number;
}) {
  const key = (slug ? String(slug) : slugify(city)).toLowerCase();
  if (!key) {
    return (
      <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#fff" }}>?</Text>
      </View>
    );
  }

  const png = (COAT_IMAGES as any)?.[key];
  if (png) {
    return <Image source={png} style={{ width: size, height: size }} resizeMode="contain" />;
  }

  // nøytral placeholder hvis ikke funnet
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.12)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
      }}
    >
      <Text style={{ color: "white", fontWeight: "700", fontSize: size * 0.33 }}>
        {key.slice(0, 1).toUpperCase() || "?"}
      </Text>
    </View>
  );
}
