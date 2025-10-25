import React, { useEffect } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        await new Promise((r) => setTimeout(r, 50));
      } finally {
        if (mounted) SplashScreen.hideAsync();
      }
    };
    init();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#0b132b" }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ contentStyle: { backgroundColor: "#0b132b" } }} />
    </View>
  );
}
