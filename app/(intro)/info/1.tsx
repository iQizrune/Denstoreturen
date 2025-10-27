// app/(intro)/info/1.tsx
import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getProfile } from "@/src/state/profile";
import WelcomePoster from "@/components/posters/WelcomePoster";

export default function Info1() {
  const router = useRouter();
  const p: any = getProfile?.() || { name: "" };
  const hasProfile = !!(p?.name && String(p.name).trim().length > 0);

  const [ready, setReady] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const flag = await AsyncStorage.getItem("app:welcomeShown");
        if (!mounted) return;
        setShowWelcome(flag ? false : true); // vis bare første gang
      } catch {
        if (!mounted) return;
        setShowWelcome(true);
      } finally {
        if (mounted) setReady(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const onContinue = async () => {
    try { await AsyncStorage.setItem("app:welcomeShown", "1"); } catch {}
    if (hasProfile) router.replace("/info/2");
    else router.replace("/profile");
  };

  useEffect(() => {
    if (!ready) return;
    if (!showWelcome) {
      if (hasProfile) router.replace("/info/2");
      else router.replace("/profile");
    }
  }, [ready, showWelcome]);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0b132b", justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#94a3b8" }}>Laster…</Text>
      </View>
    );
  }

  return <WelcomePoster visible={showWelcome} onContinue={onContinue} />;
}
