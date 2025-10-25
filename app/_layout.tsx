import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useAppLifecycleBridge } from "@/src/lib/appLifecycle";


SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useAppLifecycleBridge();
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
    <View style={styles.root}>
      <LinearGradient
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
        colors={["#0b132b", "#0e1a3a"]}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <Stack
   screenOptions={{
     contentStyle: styles.screen,
     statusBarStyle: "light",
     statusBarTranslucent: true,
     statusBarBackgroundColor: "#0b132b",
     headerShown: false, // valgfritt: fjerner evt. header-linje
   }}
 />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0b132b" },
  screen: { backgroundColor: "transparent" },
});
