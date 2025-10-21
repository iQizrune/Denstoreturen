import * as React from "react";
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle, PressableProps } from "react-native";

export type PrimaryButtonProps = PressableProps & {
  title?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  children?: React.ReactNode;
};

export default function PrimaryButton({
  title,
  onPress,
  style,
  textStyle,
  children,
  ...rest
}: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.btn, style]}
      {...rest}
    >
      {children ? (
        children
      ) : (
        <Text style={[styles.txt, textStyle]}>{title ?? "OK"}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: "#2b6cb0" },
  txt: { color: "#fff", fontWeight: "700" },
});
