import React from 'react';
import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function KartWeb() {
  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#111', gap: 12, justifyContent: 'center' }}>
      <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>Kart-test</Text>
      <Text style={{ color: '#ccc' }}>
        Kartet vises kun på mobil i denne røyk-testen. Åpne appen i Expo Go og gå til /kart.
      </Text>
      <Link href="/start" style={{ color: '#60a5fa', marginTop: 8 }}>Til start</Link>
    </View>
  );
}
