import React, { useEffect, useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import { addMeters, getTotalMeters } from '@/src/state/run';
import { getNextPhaseAfterResults } from '@/src/engine/conductor';

export default function Results() {
  const { correct, total, cat, meters } = useLocalSearchParams<{
    correct?: string; total?: string; cat?: string; meters?: string;
  }>();
  const router = useRouter();

  const k = Math.max(0, Number(correct ?? 0));
  const t = Math.max(0, Number(total ?? 0));
  const m = Math.max(0, Number(meters ?? 0));
  const c = typeof cat === 'string' && cat ? cat : 'general';
  const pct = t > 0 ? Math.round((k / t) * 100) : 0;

  useEffect(() => {
    addMeters(m);
    const phase = getNextPhaseAfterResults();
    if (phase === 'stop') {
      router.replace('/stop');
    }
  }, [m, router]);

  const cumulative = getTotalMeters();
  const next = useMemo(() => getNextPhaseAfterResults(), [cumulative]);

  const onContinue = () => {
    if (next === 'stop') router.replace('/stop');
    else router.replace(`/play?cat=${c}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#111', padding: 24, gap: 14, justifyContent: 'center' }}>
      <Text style={{ color: 'white', fontSize: 24, fontWeight: '800' }}>Resultat</Text>
      <Text style={{ color: '#9ca3af', fontSize: 16 }}>Kategori: <Text style={{ color: 'white' }}>{c.toUpperCase()}</Text></Text>
      <Text style={{ color: 'white', fontSize: 20, fontWeight: '700' }}>{k} av {t} riktig ({pct}%)</Text>
      <Text style={{ color: '#9ca3af' }}>Meter denne runden: <Text style={{ color: 'white', fontWeight: '700' }}>{m}</Text></Text>
      <Text style={{ color: '#9ca3af' }}>Totalt denne økten: <Text style={{ color: 'white', fontWeight: '700' }}>{cumulative}</Text></Text>

      <Pressable onPress={onContinue}
        style={{ backgroundColor: '#60a5fa', padding: 14, borderRadius: 12 }}>
        <Text style={{ color: 'white', fontWeight: '700', textAlign: 'center' }}>
          {next === 'stop' ? 'Til stoppested' : `Spill videre i ${c.toUpperCase()}`}
        </Text>
      </Pressable>

      <Link href="/start" style={{ color: '#60a5fa' }}>Til start</Link>
      <Link href="/kart" style={{ color: '#60a5fa' }}>Se kart</Link>
    </View>
  );
}
