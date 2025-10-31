// components/bag/BagPanel.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  AccessibilityInfo,
  Image,
} from "react-native";

// Bestående bag (byvåpen) – uendret
import { getItems, subscribe, BagItem } from "@/components/bag/bagStore";
import { BagIcon } from "@/components/bag/BagIcon";

// HJELPEMIDLER (nytt) – relative importer til src/
// Justér stiene hvis mappestrukturen er annerledes hos deg.
import {
  subscribe as subscribeHelps,
  isHydrated as helpsHydrated,
  hydrateHelpers,
  getAll as getHelpsMap,
  listUnused,
  listWon,
  listLost,
} from "../../src/state/helpersStore";
import { getHelperImage } from "../../src/data/helper_images";
import type { HelperKey } from "../../src/types/helpers";
import type { HelpStatus } from "../../src/types/helpStatus";

type HelpsMap = Partial<Record<HelperKey, HelpStatus>>;




type Props = {
  onClose?: () => void;
  visible?: boolean;
  onOpenMap?: () => void;
  title?: string;
};

// Enkel “tile” for et hjelpemiddel
function HelpTile({ keyName, status }: { keyName: HelperKey; status: HelpStatus }) {
  const img = getHelperImage(keyName);
  const palette =
    status === "won"
      ? { border: "#c6a700", fg: "#fde68a" } // gyllen
      : status === "lost"
      ? { border: "#475569", fg: "#94a3b8" } // grålig
      : { border: "#2563eb", fg: "#dbeafe" }; // unused (blå aksent)

  return (
    <View style={[styles.helpCard, { borderColor: palette.border }]}>
      {/* Bruker BagIcon-mønsteret: men her rendres bare et Image via require() */}
      {/* Hvis du har en felles <BagIcon> som også kan vise helpers, si fra – så bytter vi til den. */}
      <View style={styles.helpIconBox}>
        {/* @ts-ignore: React Native Image via require */}
        <Image source={img} style={{ width: 56, height: 56, resizeMode: "contain" }} />
      </View>
      <Text style={[styles.helpTitle, { color: palette.fg }]}>{keyName}</Text>
      <Text style={styles.helpMeta}>
        {status === "unused" ? "ubrukt" : status === "won" ? "vunnet" : "tapt"}
      </Text>
    </View>
  );
}

export default function BagPanel({ onClose, visible = true }: Props) {
  if (!visible) return null;

  // BYVÅPEN (som før)
  const [items, setItems] = useState<BagItem[]>(() => getItems());
  useEffect(() => {
    const off = subscribe(() => setItems(getItems()));
    return off;
  }, []);
  const coats = useMemo(
    () => items.filter((i): i is Extract<BagItem, { kind: "coat" }> => i.kind === "coat"),
    [items]
  );

  // HJELPEMIDLER (nytt)
  const [helpsSnapshot, setHelpsSnapshot] = useState<HelpsMap>({});


  useEffect(() => {
    let didCancel = false;

    // Sørg for hydrering én gang
    (async () => {
      if (!helpsHydrated()) {
        await hydrateHelpers();
      }
      if (didCancel) return;
      setHelpsSnapshot(getHelpsMap());
    })();

    // Abonner på endringer
    const off = subscribeHelps((state: HelpsMap) => {
  if (didCancel) return;
  setHelpsSnapshot(state);
});



    return () => {
      didCancel = true;
      off?.();
    };
  }, []);
  

  const helpKeysUnused = useMemo(() => listUnused(), [helpsSnapshot]);
  const helpKeysWon = useMemo(() => listWon(), [helpsSnapshot]);
  const helpKeysLost = useMemo(() => listLost(), [helpsSnapshot]);

  const renderCoat = useCallback(
    ({ item }: { item: Extract<BagItem, { kind: "coat" }> }) => (
      <View
        style={styles.coatCard}
        accessible
        accessibilityRole="imagebutton"
        accessibilityLabel={`Byvåpen ${item.city}`}
      >
        <BagIcon slug={item.city} city={item.city} size={64} />
        <Text style={styles.coatTitle}>🛡️ {item.city}</Text>
        <Text style={styles.coatMeta}>{new Date(item.earnedAt).toLocaleDateString()}</Text>
      </View>
    ),
    []
  );

  const focusListForA11y = () => {
    AccessibilityInfo.announceForAccessibility?.(
      "Mine ting. Rull horisontalt for å se flere."
    );
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

      {/* BYVÅPEN – uendret */}
      <Text style={styles.sectionLabel}>Byvåpen</Text>
      {coats.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTxt}>
            Ingen byvåpen enda. Klarer du 5 riktige på et stopp?
          </Text>
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

      {/* HJELPEMIDLER – ny seksjon */}
      <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Hjelpemidler</Text>

      {helpKeysUnused.length + helpKeysWon.length + helpKeysLost.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTxt}>
            Ingen hjelpemidler enda. De dukker opp som plakater underveis på etappen.
          </Text>
        </View>
      ) : (
        <>
          {/* Ubrukt */}
          {helpKeysUnused.length > 0 && (
            <>
              <Text style={styles.pillLabel}>Tilgjengelige</Text>
              <FlatList
                data={helpKeysUnused}
                keyExtractor={(k) => `u-${k}`}
                renderItem={({ item }) => <HelpTile keyName={item} status="unused" />}
                horizontal
                scrollEnabled
                nestedScrollEnabled
                showsHorizontalScrollIndicator={true}
                contentContainerStyle={styles.listContent}
                style={styles.list}
              />
            </>
          )}

          {/* Vunnet */}
          {helpKeysWon.length > 0 && (
            <>
              <Text style={styles.pillLabel}>Brukt riktig</Text>
              <FlatList
                data={helpKeysWon}
                keyExtractor={(k) => `w-${k}`}
                renderItem={({ item }) => <HelpTile keyName={item} status="won" />}
                horizontal
                scrollEnabled
                nestedScrollEnabled
                showsHorizontalScrollIndicator={true}
                contentContainerStyle={styles.listContent}
                style={styles.list}
              />
            </>
          )}

          {/* Tapt */}
          {helpKeysLost.length > 0 && (
            <>
              <Text style={styles.pillLabel}>Brukt feil</Text>
              <FlatList
                data={helpKeysLost}
                keyExtractor={(k) => `l-${k}`}
                renderItem={({ item }) => <HelpTile keyName={item} status="lost" />}
                horizontal
                scrollEnabled
                nestedScrollEnabled
                showsHorizontalScrollIndicator={true}
                contentContainerStyle={styles.listContent}
                style={styles.list}
              />
            </>
          )}
        </>
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

  // Hjelpemidler
  pillLabel: {
    color: "#a5b4fc",
    fontSize: 12,
    marginTop: 8,
    marginBottom: 6,
    fontWeight: "700",
  },
  helpCard: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#0e1726",
    borderWidth: 1,
    marginRight: 8,
    alignItems: "center",
    minWidth: 120,
  },
  helpIconBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#0b1220",
    alignItems: "center",
    justifyContent: "center",
  },
  helpTitle: {
    fontWeight: "800",
    marginTop: 8,
  },
  helpMeta: {
    color: "#9ca3af",
    marginTop: 4,
    fontSize: 12,
  },
});
