// app/ui/ConfettiBurst.tsx
import React, { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";

export default function ConfettiBurst({ visible }: { visible: boolean }) {
  const pieces = 18;
  const anims = useRef(Array.from({ length: pieces }, () => new Animated.Value(0))).current;

  useEffect(() => {
    if (!visible) return;
    anims.forEach((v) => v.setValue(0));
    Animated.stagger(
      12,
      anims.map((v) =>
        Animated.timing(v, {
          toValue: 1,
          duration: 1400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ),
    ).start();
  }, [visible, anims]);

  if (!visible) return null;

  const palette = ["#f87171", "#34d399", "#60a5fa", "#fbbf24", "#a78bfa", "#f472b6"];

  return (
    <View
      pointerEvents="none"
      style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, zIndex: 1500 }}
    >
      {anims.map((v, i) => {
        const angle = (i / pieces) * Math.PI * 2;
        const distance = 180;
        const tx = v.interpolate({ inputRange: [0, 1], outputRange: [0, Math.cos(angle) * distance] });
        const ty = v.interpolate({ inputRange: [0, 1], outputRange: [0, Math.sin(angle) * distance + 80] });
        const rot = v.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", (i % 2 ? 1 : -1) * 180 + "deg"],
        });
        const opacity = v.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0] });
        const w = 6 + (i % 3) * 3;
        const h = Math.max(4, Math.round(w * 0.6));
        return (
          <Animated.View
            key={`confetti-${i}`}
            style={{
              position: "absolute",
              left: "50%",
              top: 100,
              width: w,
              height: h,
              backgroundColor: palette[i % palette.length],
              opacity,
              transform: [{ translateX: tx }, { translateY: ty }, { rotate: rot }],
              borderRadius: 1,
            }}
          />
        );
      })}
    </View>
  );
}
