import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { getProfile, setProfile, type AgeGroup } from '@/src/state/profile';

export default function Profil() {
  const router = useRouter();
  const initial = useMemo(() => getProfile(), []);
  const [name, setName] = useState(initial.name);
  const [age, setAge] = useState<AgeGroup>(initial.ageGroup);
  const [avatar, setAvatar] = useState(initial.avatar || '🚶');

  const avatars = ['🚶','🧒','🧑','🧓','🏃','🚴','🥾','🎒'];
  const groups: AgeGroup[] = ['barn','ung','voksen'];

  const onSave = () => {
    setProfile({ name: name.trim(), ageGroup: age, avatar });
    router.replace('/start');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#111', padding: 24, gap: 16, justifyContent: 'center' }}>
      <Text style={{ color: 'white', fontSize: 24, fontWeight: '800' }}>Profil</Text>

      <Text style={{ color: '#9ca3af' }}>Navn</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Skriv navn"
        placeholderTextColor="#6b7280"
        style={{ backgroundColor: '#1f2937', color: 'white', padding: 12, borderRadius: 10 }}
      />

      <Text style={{ color: '#9ca3af' }}>Aldersgruppe</Text>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {groups.map(g => (
          <Pressable key={g} onPress={() => setAge(g)}
            style={{ backgroundColor: g===age ? '#60a5fa' : '#e5e7eb', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999 }}>
            <Text style={{ color: g===age ? 'white' : 'black', fontWeight: '700' }}>{g}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={{ color: '#9ca3af' }}>Avatar</Text>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {avatars.map(a => (
          <Pressable key={a} onPress={() => setAvatar(a)}
            style={{ backgroundColor: a===avatar ? '#60a5fa' : '#e5e7eb', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 }}>
            <Text style={{ fontSize: 18 }}>{a}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={onSave} style={{ backgroundColor: '#60a5fa', padding: 14, borderRadius: 12 }}>
        <Text style={{ color: 'white', fontWeight: '700', textAlign: 'center' }}>Lagre</Text>
      </Pressable>

      <Link href="/start" style={{ color: '#60a5fa' }}>Til start</Link>
    </View>
  );
}
