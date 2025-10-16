import React, { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { loadCityBank } from '@/src/banks/cityAdapter';
import { getProfile } from '@/src/state/profile';
import { getCurrentStop } from '@/src/state/route';

type QA = { q: string; a: string; choices: string[] };

export default function StopPanel({ onComplete }: { onComplete: () => void }) {
  const stop = getCurrentStop();
  const profile = getProfile?.();
  const age = profile?.ageGroup ?? 'voksen';

  const tasks = useMemo<QA[]>(() => {
    const cityId = stop?.id ?? 'lillehammer';
    return loadCityBank(cityId, age);
  }, [stop?.id, age]);

  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(false);

  if (!tasks.length) {
    return (
      <View style={{ gap: 12 }}>
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>Ingen stopp-oppgaver</Text>
        <Pressable onPress={onComplete} style={{ backgroundColor: '#60a5fa', padding: 12, borderRadius: 10 }}>
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>Fortsett</Text>
        </Pressable>
      </View>
    );
  }

  if (done) {
    return (
      <View style={{ gap: 12 }}>
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>Ferdig med stopp</Text>
        <Pressable onPress={onComplete} style={{ backgroundColor: '#60a5fa', padding: 12, borderRadius: 10 }}>
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>Fortsett ruten</Text>
        </Pressable>
      </View>
    );
  }

  const t = tasks[idx];
  const onPick = (choice: string) => {
    const next = idx + 1;
    if (next < tasks.length) setIdx(next);
    else setDone(true);
  };

  return (
    <View style={{ gap: 14 }}>
      <Text style={{ color: '#9ca3af', fontWeight: '700' }}>Stoppested</Text>
      <Text style={{ color: 'white', fontSize: 20, fontWeight: '800' }}>{stop?.name ?? 'Stopp'}</Text>
      <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>{t.q}</Text>
      <View style={{ gap: 8 }}>
        {t.choices.map((c, i) => (
          <Pressable key={i} onPress={() => onPick(c)} style={{ backgroundColor: '#e5e7eb', padding: 14, borderRadius: 12 }}>
            <Text>{c}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={{ color: '#9ca3af' }}>{idx + 1} / {tasks.length}</Text>
    </View>
  );
}
