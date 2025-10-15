import React from 'react';
import { View, Text } from 'react-native';
import { Link } from 'expo-router';
export default function NotFound() {
  return (
    <View style={{ flex: 1, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Text style={{ color: 'white', fontSize: 22, fontWeight: '700' }}>Siden finnes ikke</Text>
      <Link href="/start" style={{ color: '#60a5fa', marginTop: 8 }}>Til start</Link>
    </View>
  );
}
