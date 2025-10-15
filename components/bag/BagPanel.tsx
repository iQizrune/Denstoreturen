// components/bag/BagPanel.tsx
import React, { useEffect, useState } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { getItems, subscribe, type BagItem } from "./bagStore";

export default function BagPanel({
  visible,
  onClose,
  onOpenMap,
  title,
}: {
  visible: boolean;
  onClose: () => void;
  onOpenMap: () => void;
  title?: string;
}) {

  const [items, setItems] = useState<BagItem[]>(getItems());

  useEffect(() => {
    const off = subscribe(() => setItems(getItems()));
    return off;
  }, []);

  if (!visible) return null;

  const coats = items.filter((i) => i.kind === "coat");

  return (
    <View
      pointerEvents="auto"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        padding: 12,
        backgroundColor: "rgba(12,18,32,0.98)",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderWidth: 1,
        borderColor: "#2b3446",
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <Text style={{ color: "#93c5fd", fontWeight: "800" }}>
  {title ?? "Mine ting"}
</Text>

        <Pressable onPress={onClose} android_ripple={{ color: "rgba(255,255,255,0.15)" }}>
          <Text style={{ color: "#cbd5e1", fontWeight: "700" }}>Lukk</Text>
        </Pressable>
      </View>

      {/* Byvåpen-seksjon */}
      <View style={{ marginBottom: 12 }}>
        <Text style={{ color: "#e5e7eb", fontWeight: "700", marginBottom: 6 }}>Byvåpen</Text>
        {coats.length === 0 ? (
          <Text style={{ color: "#9ca3af" }}>Ingen byvåpen ennå — vinn ved å klare 5+ riktige på stopp.</Text>
        ) : (
          <FlatList
            data={coats}
            keyExtractor={(it) => it.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View
                style={{
                  padding: 10,
                  borderRadius: 12,
                  backgroundColor: "#111827",
                  borderWidth: 1,
                  borderColor: "#374151",
                  marginRight: 8,
                  alignItems: "center",
                  minWidth: 120,
                }}
              >
                <Text style={{ color: "#bbf7d0", fontWeight: "800" }}>🛡️ {item.city}</Text>
                <Text style={{ color: "#9ca3af", marginTop: 4, fontSize: 12 }}>
                  {new Date(item.earnedAt).toLocaleDateString()}
                </Text>
              </View>
            )}
          />
        )}
      </View>

      {/* Snarveier */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Pressable
          onPress={onOpenMap}
          android_ripple={{ color: "rgba(255,255,255,0.15)" }}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 14,
            backgroundColor: "#2563eb",
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Åpne kart</Text>
        </Pressable>

        <Pressable
          onPress={onClose}
          android_ripple={{ color: "rgba(255,255,255,0.15)" }}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 14,
            backgroundColor: "#1f2937",
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#374151",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Ferdig</Text>
        </Pressable>
      </View>
    </View>
  );
}
