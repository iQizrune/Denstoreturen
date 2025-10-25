// components/bag/BagPanel.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  AccessibilityInfo,
} from "react-native";
import { getItems, subscribe, BagItem } from "@/components/bag/bagStore";
import { BagIcon } from "@/components/bag/BagIcon";

type Props = {
  onClose?: () => void;
  visible?: boolean;      // ny
  onOpenMap?: () => void; // ny (kan ignoreres)
  title?: string;         // ny (kan ignoreres)
};

export default function BagPanel({ onClose, visible = true }: Props) {
  if (!visible) return null;
  const [items, setItems] = useState<BagItem[]>(() => getItems());

  useEffect(() => {
    const off = subscribe(() => setItems(getItems()));
    return off;
  }, []);

  const coats = useMemo(
    () => items.filter((i): i is Extract<BagItem, { kind: "coat" }> => i.kind === "coat"),
    [items]
  );

  const renderCoat = useCallback(
    ({ item }: { item: Extract<BagItem, { kind: "coat" }> }) => (
      <View style={styles.coatCard} accessible accessibilityRole="imagebutton" accessibilityLabel={`Byvåpen ${item.city}`}>
        <BagIcon slug={item.city} city={item.city} size={64} />
        <Text style={styles.coatTitle}>🛡️ {item.city}</Text>
        <Text style={styles.coatMeta}>
          {new Date(item.earnedAt).toLocaleDateString()}
        </Text>
      </View>
    ),
    []
  );

  const focusListForA11y = () => {
    AccessibilityInfo.announceForAccessibility?.("Mine ting. Rull horisontalt for å se flere.");
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Mine ting</Text>
        {onClose && (
          <Pressable
            onPress={onClose}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel="Lukk"
          >
            <Text style={styles.closeTxt}>Lukk</Text>
          </Pressable>
        )}
      </View>

      <Text style={styles.sectionLabel}>Byvåpen</Text>

      {coats.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTxt}>Ingen byvåpen enda. Klarer du 5 riktige på et stopp?</Text>
        </View>
      ) : (
        <FlatList
          data={coats}
          keyExtractor={(it) => it.id}
          renderItem={renderCoat}
          horizontal
          scrollEnabled
          nestedScrollEnabled
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={styles.listContent}
          style={styles.list}
          onLayout={focusListForA11y}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: "#0B0B0E",
    padding: 16,
    borderRadius: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    flex: 1,
  },
  closeBtn: {
    backgroundColor: "#1F2937",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  closeTxt: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  sectionLabel: {
    color: "#CBD5E1",
    fontSize: 14,
    marginBottom: 8,
  },
  list: {
    flexGrow: 0,
    maxHeight: 180,
  },
  listContent: {
    paddingHorizontal: 8,
  },
  coatCard: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#374151",
    marginRight: 8,
    alignItems: "center",
    minWidth: 120,
  },
  coatTitle: {
    color: "#bbf7d0",
    fontWeight: "800",
    marginTop: 8,
  },
  coatMeta: {
    color: "#9ca3af",
    marginTop: 4,
    fontSize: 12,
  },
  emptyBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
    backgroundColor: "#0F172A",
  },
  emptyTxt: {
    color: "#94A3B8",
    textAlign: "center",
  },
});
