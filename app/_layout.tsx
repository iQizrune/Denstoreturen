// app/_layout.tsx
import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useAppLifecycleBridge } from "@/src/lib/appLifecycle";

// 🔽 Mine ting (global knapp + panel)
import TopbarMineTingButton from "@/src/features/mine-ting/TopbarMineTingButton";
import MineTingPanel from "@/src/features/mine-ting/MineTingPanel";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useAppLifecycleBridge();

  // DEV: stageQueue-watchdog beholdes uendret
  useEffect(() => {
    if (__DEV__) {
      const { startStageQueueWatchdog, stopStageQueueWatchdog } = require("@/src/dev/watchdogStageQueue");
      startStageQueueWatchdog();
      return () => {
        stopStageQueueWatchdog();
      };
    }
  }, []);

  // Splash-init beholdes uendret
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        await new Promise((r) => setTimeout(r, 50));
      } finally {
        if (mounted) {
          await SplashScreen.hideAsync();
        }
      }
    };
    init();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View style={styles.root}>
      <LinearGradient
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
        colors={["#0b132b", "#0e1a3a"]}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* Router-stack beholdes uendret */}
      <Stack
        screenOptions={{
          contentStyle: styles.screen,
          statusBarStyle: "light",
          statusBarTranslucent: true,
          statusBarBackgroundColor: "#0b132b",
          headerShown: false,
        }}
      />

      {/* 🔽 Fast plassert toppbar-knapp (deaktiveres via mineTingStore.setDisabled(true)) */}
      <View style={styles.topRightOverlay} pointerEvents="box-none">
        <TopbarMineTingButton />
      </View>

      {/* 🔽 Globalt panel (modal) – alltid montert, påvirker ikke StopModule-flyt */}
      <MineTingPanel />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0b132b" },
  screen: { backgroundColor: "transparent" },

  // Plasseres under translucent statusbar; juster top om nødvendig
  topRightOverlay: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1000,
  },
});
