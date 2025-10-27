import React, { useEffect, useState } from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { mineTingStore } from "./mineTingStore";

export default function TopbarMineTingButton() {
  const [disabled, setDisabled] = useState(mineTingStore.disabled);
  useEffect(() => mineTingStore.subscribe(() => setDisabled(mineTingStore.disabled)), []);

  return (
    <Pressable
      onPress={() => (disabled ? null : mineTingStore.openPanel())}
      accessibilityRole="button"
      accessibilityLabel="Åpne Mine ting"
      style={[styles.btn, disabled && styles.btnDisabled]}
    >
      <Text style={[styles.label, disabled && styles.labelDisabled]}>Mine ting</Text>
      {disabled ? (
        <View style={styles.hintWrap}>
          <Text style={styles.hint}>Vises i pauser og stopp</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "white",
    marginLeft: 8,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  label: { fontWeight: "600" },
  labelDisabled: {},
  hintWrap: { marginTop: 2 },
  hint: { fontSize: 10, opacity: 0.7 },
});
