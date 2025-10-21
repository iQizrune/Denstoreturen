// src/partials/TimeBar.tsx
import * as React from "react";
import { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";

type Props = {
  durationMs: number;
  paused?: boolean;
  height?: number;
  trackColor?: string;
  barColor?: string;
  onElapsed?: () => void;   // kalles når tiden er brukt opp
};

export default function TimeBar({
  durationMs,
  paused = false,
  height = 6,
  trackColor = "#333",
  barColor = "#27AE60",
  onElapsed,
}: Props) {
  const progress = useRef(new Animated.Value(1)).current; // 1 → 0
  const remainingRef = useRef<number>(durationMs);

  const start = (ms: number) => {
    if (ms <= 0) {
      progress.setValue(0);
      remainingRef.current = 0;
      onElapsed && onElapsed();
      return;
    }
    remainingRef.current = ms;
    Animated.timing(progress, {
      toValue: 0,
      duration: ms,
      useNativeDriver: true, // scaleX
    }).start(({ finished }) => {
      if (finished) {
        remainingRef.current = 0;
        onElapsed && onElapsed();
      }
    });
  };

  // Start på nytt ved ny varighet (eller remount via key)
  useEffect(() => {
    progress.setValue(1);
    start(durationMs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationMs]);

  // Pause / fortsett
  useEffect(() => {
    if (paused) {
      progress.stopAnimation((v) => {
        remainingRef.current = Math.max(0, v) * durationMs;
      });
    } else {
      const ms = Math.max(0, Math.round(remainingRef.current));
      start(ms);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  return (
    <View style={[styles.track, { height, backgroundColor: trackColor }]}>
      <Animated.View
        style={[
          styles.bar,
          {
            backgroundColor: barColor,
            transform: [{ scaleX: progress }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: "100%",
    overflow: "hidden",
    borderRadius: 999,
  },
  bar: {
    height: "100%",
    width: "100%",
  },
});
