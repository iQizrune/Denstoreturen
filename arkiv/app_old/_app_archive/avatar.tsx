// app/avatar.tsx
import React, { useEffect, useState } from "react";
import { View, Image, Pressable, FlatList, StyleSheet, ImageSourcePropType } from "react-native";
import { useRouter } from "expo-router";
import { SINGLE_PLAYER_MODE } from "../src/constants/flags";
import { getProfile } from "@/src/features/profile/ProfileManager";
// Øverst i app/avatar.tsx
import { getAvatar, setAvatar, updateProfile } from "../src/storage/profile";




type Av = { key: string; src: ImageSourcePropType };

// 6 nøytrale avatarer (PNG med transparent bakgrunn)
const AVATARS: Av[] = [
  { key: "av1", src: require("../assets/avatars/eagle.png") },
  { key: "av2", src: require("../assets/avatars/wolf.png") },
  { key: "av3", src: require("../assets/avatars/bear.png") },
  { key: "av4", src: require("../assets/avatars/fox.png") },
  { key: "av5", src: require("../assets/avatars/owl.png") },
  { key: "av6", src: require("../assets/avatars/lynx.png") },
];

export default function AvatarScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  // Prefill + engangsmigrering fra gamle nøkler ("rune"/"grethe") til "av1"/"av2"
  useEffect(() => {
    getAvatar()
      .then((a: string | null) => {
        const migrated = a === "rune" ? "av1" : a === "grethe" ? "av2" : a;
        setSelected(migrated);
      })
      .catch(() => {});
  }, []);

  async function choose(key: string) {
    setSelected(key);
    await setAvatar(key);
    if (SINGLE_PLAYER_MODE) {
      try {
        await updateProfile({ avatarKey: key });
      } catch {}
    }
    router.back();
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={AVATARS}
        keyExtractor={(it) => it.key}
        numColumns={3}
        columnWrapperStyle={styles.row}
        renderItem={({ item, index }) => {
          const isSel = selected === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => choose(item.key)}
              android_ripple={{ color: "#334155" }}
              style={[
                styles.card,
                { borderColor: isSel ? "#60a5fa" : "#374151", borderWidth: isSel ? 2 : 1 },
                { marginRight: (index + 1) % 3 === 0 ? 0 : 12 },
              ]}
            >
              {/* Viktig: ingen bakgrunnsfarge -> transparent PNG vises uten “kvadrat” */}
              <Image source={item.src} style={styles.img} />
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, alignItems: "center", justifyContent: "center" },
  row: { justifyContent: "center", marginBottom: 12 },
  card: {
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 16,
    // bevisst ingen backgroundColor -> respekterer PNG-transparens
  },
  img: { width: 100, height: 100, borderRadius: 9999 },
});
