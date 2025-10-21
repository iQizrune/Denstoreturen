import React, { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import PlayingPanels from '@/src/partials/PlayingPanels';
import { conductor } from '@/src/engine/conductor';

export default function PlayScreen() {
  const router = useRouter();
  const { cat } = useLocalSearchParams<{ cat?: string }>();

  // Abonner på dirigenten (reaktivt UI)
  const [snap, setSnap] = useState(conductor.getSnapshot());
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    const off = conductor.on(next => setSnap(next));
    conductor.start((cat as string) || undefined);
    return () => { off(); };
  }, [cat]);

  const meters = snap.meters;

  return (
    <View style={{ flex: 1 }}>
      <PlayingPanels
        bankKey={(cat as string) || 'general'}
        onCorrect={() => { conductor.answer(true); setAnswered(true); }}
        onWrong={() => { conductor.answer(false); setAnswered(true); }}
        onFinished={() => { conductor.finish(); router.replace('/results'); }}
      />

      <View style={{ padding: 12 }}>
        <Text>Fase: {snap.phase}</Text>
        <Text>Meter: {meters}</Text>

        <Pressable
          disabled={!answered}
          onPress={() => { conductor.finish(); router.replace('/results'); }}
          style={{ marginTop: 8, opacity: answered ? 1 : 0.5, backgroundColor: '#e5e7eb', padding: 12, borderRadius: 8 }}
        >
          <Text>Fullfør spill →</Text>
        </Pressable>

        <Link href="/start" style={{ marginTop: 8, color: '#60a5fa' }}>Til start</Link>
      </View>

      <View style={{ position: 'absolute', bottom: 16, right: 16 }}>
        <Link href="/kart" asChild>
          <Pressable style={{ backgroundColor: '#111', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: '#333' }}>
            <Text style={{ color: '#60a5fa', fontWeight: '700' }}>🗺️</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
