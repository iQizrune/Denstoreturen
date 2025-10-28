// src/components/posters/RewardToast.tsx
import React from "react";
import { Modal, View, Text, StyleSheet } from "react-native";

type Variant = "success" | "fail";

export type RewardToastProps = {
  visible: boolean;
  variant?: Variant;
  title: string;
  subtitle?: string;
};

export default function RewardToast({
  visible,
  variant = "success",
  title,
  subtitle,
}: RewardToastProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            variant === "success" ? styles.success : styles.fail,
          ]}
        >
          <Text style={styles.title}>
            {variant === "success" ? "🛡️ " : "🤷 "}{title}
          </Text>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.15)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  card: {
    minWidth: 260,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
  },
  success: {
    backgroundColor: "#14532d",
    borderColor: "#22c55e",
  },
  fail: {
    backgroundColor: "#3f1f1f",
    borderColor: "#ef4444",
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    color: "#f8fafc",
    fontSize: 14,
    textAlign: "center",
  },
});
