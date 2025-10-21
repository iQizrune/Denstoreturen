import * as React from "react";
import { View, Text, Pressable, StyleSheet, ViewStyle } from "react-native";

export type UseHelpPosterProps = {
  visible?: boolean;
  title?: string;
  onClose?: () => void;
  style?: ViewStyle;
  children?: React.ReactNode;
};

export default function UseHelpPoster({
  visible = true,
  title = "Hjelp",
  onClose,
  style,
  children,
}: UseHelpPosterProps) {
  if (!visible) return null;
  return (
    <View style={[styles.root, style]}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.body}>{children ?? <Text>Ingen hjelpetekst lagt inn ennå.</Text>}</View>
      {onClose ? (
        <Pressable accessibilityRole="button" onPress={onClose} style={styles.btn}>
          <Text style={styles.btnText}>Lukk</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  body: {
    gap: 8,
  },
  btn: {
    alignSelf: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
  },
});
