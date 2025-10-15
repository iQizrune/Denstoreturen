import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

type Action = { label: string; onPress: () => void; testID?: string };

export type PosterBaseProps = {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  primary?: Action;
  secondary?: Action;
  tertiary?: Action;
};

export default function PosterBase({
  title,
  subtitle,
  children,
  primary,
  secondary,
  tertiary,
}: PosterBaseProps) {
  return (
    <View style={s.backdrop} pointerEvents="box-none">
      <View style={s.card}>
        <Text style={s.title}>{title}</Text>
        {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
        <View style={s.body}>{children}</View>
        <View style={s.row}>
          {secondary ? (
            <Pressable accessibilityRole="button" style={[s.btn, s.btnGhost]} onPress={secondary.onPress} testID={secondary.testID}>
              <Text style={[s.btnLabel, s.btnGhostLabel]}>{secondary.label}</Text>
            </Pressable>
          ) : null}
          {tertiary ? (
            <Pressable accessibilityRole="button" style={[s.btn, s.btnGhost]} onPress={tertiary.onPress} testID={tertiary.testID}>
              <Text style={[s.btnLabel, s.btnGhostLabel]}>{tertiary.label}</Text>
            </Pressable>
          ) : null}
          {primary ? (
            <Pressable accessibilityRole="button" style={[s.btn, s.btnPrimary]} onPress={primary.onPress} testID={primary.testID}>
              <Text style={[s.btnLabel, s.btnPrimaryLabel]}>{primary.label}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  backdrop: {
    position: "absolute",
    left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#1f2937",
    borderRadius: 16,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#334155",
  },
  title: { fontSize: 20, fontWeight: "700", color: "#e5e7eb", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "#cbd5e1", marginBottom: 10 },
  body: { paddingVertical: 8 },
  row: { flexDirection: "row", gap: 8, justifyContent: "flex-end", marginTop: 12 },
  btn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  btnLabel: { fontSize: 16 },
  btnGhost: { backgroundColor: "transparent", borderWidth: StyleSheet.hairlineWidth, borderColor: "#475569" },
  btnGhostLabel: { color: "#e5e7eb" },
  btnPrimary: { backgroundColor: "#60a5fa" },
  btnPrimaryLabel: { color: "#0b1220", fontWeight: "600" },
});
