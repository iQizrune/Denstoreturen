import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { getProfile, setProfile } from '@/src/state/profile';

type AgeGroup = 'barn' | 'ungdom' | 'voksen';

export default function ProfileScreen() {
  const router = useRouter();
  const initial = getProfile();
  const [name, setName] = useState<string>(String((initial as any)?.name ?? ''));
  const [age, setAge] = useState<AgeGroup>((initial as any)?.age ?? 'voksen');

  const canSave = name.trim().length >= 2 && !!age;

  return (
    <View style={{ flex: 1, backgroundColor: '#111', padding: 20, gap: 16, justifyContent: 'center' }}>
      <Text style={{ color: 'white', fontSize: 28, fontWeight: '800', marginBottom: 8 }}>Opprett profil</Text>

      <View style={{ gap: 8 }}>
        <Text style={{ color: '#bbb', fontWeight: '700' }}>Navn</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Skriv navnet ditt"
          placeholderTextColor="#666"
          style={{ backgroundColor: '#1f2937', color: 'white', padding: 12, borderRadius: 12 }}
          autoCapitalize="words"
        />
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ color: '#bbb', fontWeight: '700' }}>Aldersgruppe</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['barn','ungdom','voksen'] as AgeGroup[]).map(g => (
            <Pressable
              key={g}
              onPress={() => setAge(g)}
              style={{ backgroundColor: age===g ? '#60a5fa' : '#e5e7eb', padding: 10, borderRadius: 10 }}
            >
              <Text style={{ color: age===g ? 'white' : 'black', fontWeight: '700' }}>{g}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable
        onPress={() => { if (!canSave) return; setProfile({ name: name.trim(), age } as any); router.replace('/start'); }}
        disabled={!canSave}
        style={{ opacity: canSave ? 1 : 0.5, backgroundColor: '#10b981', padding: 14, borderRadius: 12, marginTop: 8 }}
      >
        <Text style={{ color: 'white', fontWeight: '800', textAlign: 'center' }}>Lagre og fortsett</Text>
      </Pressable>

      <Pressable onPress={() => router.replace('/start')} style={{ padding: 12 }}>
        <Text style={{ color: '#9ca3af', textAlign: 'center' }}>Hopp over</Text>
      </Pressable>
    </View>
  );
}
