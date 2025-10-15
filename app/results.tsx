import { View, Text, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Link } from 'expo-router';


export default function Results() {
  const { score } = useLocalSearchParams<{ score?: string }>();
  const router = useRouter();
  const n = Number(score ?? 0);
  console.log('[phase] results: mount');
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#111",
        padding: 24,
      }}
    >
      <Text style={{ color: "white", fontSize: 28, fontWeight: "700" }}>Resultat</Text>
      <Text style={{ color: "#bbb", fontSize: 18, marginTop: 8 }}>Du fikk {n} poeng 🎉</Text>
      <Pressable
        onPress={() => router.replace("/game")}
        style={{ marginTop: 24, backgroundColor: "#60a5fa", padding: 16, borderRadius: 14 }}
      >
        <Text style={{ fontWeight: "700" }}>Spill igjen</Text>
      </Pressable>
      <Pressable
        onPress={() => router.replace("/")}
        style={{ marginTop: 12, backgroundColor: "#e5e7eb", padding: 14, borderRadius: 12 }}
      >
        <Text>Til hjem</Text>
      </Pressable>
    </View>
  );
}
