// components/posters/HelperPickupPoster.tsx
import React, { useEffect, useMemo, useRef } from "react";
import { Modal, View, Text, Pressable, StyleSheet, Image, Animated, Easing } from "react-native";
import * as Haptics from "expo-haptics";
// Merk: Stien under er allerede i bruk andre steder hos deg
import { getHelperImage } from "../../src/data/helper_images";
import { addHelp } from "../../src/state/helpersStore";
import type { HelperKey } from "../../src/types/helpers";

type Props = {
  visible: boolean;
  helper: HelperKey;
  onAccept: (key: HelperKey) => void;
  onClose?: () => void; // behold prop for kompatibilitet, men vi bruker den ikke
};

export default function HelperPickupPoster({ visible, helper, onAccept }: Props) {
  // Animasjonsverdier
  const iconScale = useRef(new Animated.Value(0.9)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  // Når modalen åpner: fade/scale inn ikonet
  useEffect(() => {
    if (!visible) return;
    iconScale.setValue(0.9);
    iconOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(iconOpacity, { toValue: 1, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(iconScale, { toValue: 1, friction: 6, tension: 120, useNativeDriver: true }),
    ]).start();
  }, [visible, iconOpacity, iconScale]);

  // Liten “pop” på knappen når den trykkes
  const animateButtonPress = () => {
    btnScale.setValue(1);
    Animated.sequence([
      Animated.timing(btnScale, { toValue: 0.96, duration: 80, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(btnScale, { toValue: 1, friction: 6, tension: 180, useNativeDriver: true }),
    ]).start();
  };

const onAcceptPress = async () => {
  // 1) Haptikk
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {}

  // 2) LOGG: før vi lagrer
  console.log("[HelperPickupPoster] onAcceptPress -> addHelp", helper);

  // 3) Lagre i Mine ting (helpersStore)
  try {
    await addHelp(helper);
    // 4) LOGG: etter OK lagring
    console.log("[HelperPickupPoster] addHelp OK");
  } catch (e) {
    console.warn("[HelperPickupPoster] addHelp feilet:", e);
  }

  // 5) Liten “pop”-animasjon (hvis du har denne delen fra før, behold den)
  Animated.sequence([
    Animated.timing(iconScale, { toValue: 1.06, duration: 90, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    Animated.spring(iconScale, { toValue: 1, friction: 7, tension: 180, useNativeDriver: true }),
  ]).start();

  // 6) Lukk plakaten (trigge resume i Gate)
  setTimeout(() => onAccept(helper), 220);
};

  const imgSource = useMemo(() => getHelperImage(helper), [helper]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.header}>Du fant et hjelpemiddel!</Text>

          <Animated.View style={[styles.iconWrap, { transform: [{ scale: iconScale }], opacity: iconOpacity }]}>
            <Image source={imgSource} style={styles.icon} resizeMode="contain" />
          </Animated.View>

          <Text style={styles.title}>{helper}</Text>
          <Text style={styles.sub}>Legg det i sekken for bruk senere.</Text>

          {/* Én knapp: Legg i sekken */}
          <View style={[styles.row, { justifyContent: "center" }]}>
            <Animated.View style={{ transform: [{ scale: btnScale }] }}>
              <Pressable
                style={[styles.btn, styles.btnPrimary]}
                onPress={onAcceptPress}
                accessibilityRole="button"
              >
                <Text style={styles.btnPrimaryTxt}>Legg i sekken</Text>
              </Pressable>
            </Animated.View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "84%",
    maxWidth: 420,
    backgroundColor: "#111827", // dark slate
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.08)",
  },
  header: {
    textAlign: "center",
    color: "#E5E7EB",
    fontSize: 16,
    marginBottom: 12,
  },
  iconWrap: {
    alignSelf: "center",
    width: 140,
    height: 140,
    marginVertical: 4,
  },
  icon: {
    width: "100%",
    height: "100%",
  },
  title: {
    textAlign: "center",
    color: "#F9FAFB",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 8,
    textTransform: "capitalize",
  },
  sub: {
    textAlign: "center",
    color: "#D1D5DB",
    fontSize: 14,
    marginTop: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  btn: {
    minWidth: 180,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  btnPrimary: {
    backgroundColor: "#22C55E",
  },
  btnPrimaryTxt: {
    color: "#052e12",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
