import { View, Text, Pressable } from "react-native";
import { conductor } from '@/src/engine/conductor';
import { useRouter } from 'expo-router';
import { Link } from 'expo-router';
import { publishMeters } from '@/src/lib/progressBus';



export default function Results() {
  const snap = conductor.getSnapshot();
  
  const { meters, correct, total, cat } = snap;
  const router = useRouter();
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
      <Text style={{ color: "#bbb", fontSize: 18, marginTop: 8 }}>Du fikk {meters} poeng 🎉</Text>
      <Text style={{ color: "#bbb", fontSize: 16, marginTop: 4 }}>Riktige svar: {correct} av {Math.max(1,total)} ({Math.round((correct/Math.max(1,total))*100)}%)</Text>
      <Text style={{ color: "#bbb", fontSize: 14, marginTop: 2 }}>Kategori: {cat ?? "general"}</Text>
      <Pressable
        onPress={() => { publishMeters(0); router.replace("/play"); }}
        style={{ marginTop: 24, backgroundColor: "#60a5fa", padding: 16, borderRadius: 14 }}
      >
        <Text style={{ fontWeight: "700" }}>Spill igjen</Text>
      </Pressable>
      <Pressable
        onPress={() => { publishMeters(0); router.replace("/"); }}

        style={{ marginTop: 12, backgroundColor: "#e5e7eb", padding: 14, borderRadius: 12 }}
      >
        <Text>Til hjem</Text>
      </Pressable>
      <Link href="/start" style={{ marginTop: 8, color: '#60a5fa' }}>Velg kategori</Link>
    </View>
  );
}
