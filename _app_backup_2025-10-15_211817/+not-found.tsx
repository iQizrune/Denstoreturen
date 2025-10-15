import React from 'react';
import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Text style={{ color: 'white', fontSize: 22, fontWeight: '700', marginBottom: 8 }}>Siden finnes ikke</Text>
      <Link href="/start" style={{ color: '#60a5fa', marginTop: 8 }}>Gå til start</Link>
    </View>
  );
}
